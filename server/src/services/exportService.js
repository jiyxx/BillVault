const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const expenseDal = require('../dal/expenseDal');
const categoryDal = require('../dal/categoryDal');
const { format } = require('date-fns');

class ExportService {
  /**
   * Export expenses to PDF
   */
  async exportToPdf(userId, filters, res) {
    try {
      const { startDate, endDate, category, tripId } = filters;
      
      // Fetch data
      let expenses;
      if (tripId) {
        expenses = await expenseDal.getExpensesByTrip(userId, tripId);
      } else {
        expenses = await expenseDal.getExpensesByUser(userId, {
          startDate,
          endDate,
          category
        });
      }
      
      // Create a document
      const doc = new PDFDocument({ margin: 50 });
      
      // Pipe the PDF into the response
      doc.pipe(res);
      
      // Header
      doc.fontSize(20).text('BillVault Expense Report', { align: 'center' });
      doc.moveDown();
      
      // Subtitle with filters
      doc.fontSize(12).fillColor('gray');
      let subtitle = `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`;
      if (startDate && endDate) {
        subtitle += ` | Period: ${startDate} to ${endDate}`;
      } else if (tripId) {
        subtitle += ` | Filter: specific trip`;
      }
      doc.text(subtitle, { align: 'center' });
      doc.moveDown(2);
      
      // Reset text options
      doc.fillColor('black');
      
      // Calculate total
      const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      doc.fontSize(14).text(`Total Expenses: ${totalAmount.toFixed(2)} USD`, { bold: true });
      doc.moveDown();
      
      // Table Header
      const tableTop = doc.y;
      const columnPositions = {
        date: 50,
        merchant: 150,
        category: 300,
        amount: 450
      };
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Date', columnPositions.date, tableTop);
      doc.text('Merchant', columnPositions.merchant, tableTop);
      doc.text('Category', columnPositions.category, tableTop);
      doc.text('Amount', columnPositions.amount, tableTop, { align: 'right', width: 90 });
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      
      // Table Rows
      let y = tableTop + 25;
      doc.font('Helvetica').fontSize(10);
      
      for (let i = 0; i < expenses.length; i++) {
        const exp = expenses[i];
        
        // Handle pagination
        if (y > 700) {
          doc.addPage();
          y = 50; // reset y
          
          // Redraw header
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Date', columnPositions.date, y);
          doc.text('Merchant', columnPositions.merchant, y);
          doc.text('Category', columnPositions.category, y);
          doc.text('Amount', columnPositions.amount, y, { align: 'right', width: 90 });
          doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
          
          y += 25;
          doc.font('Helvetica').fontSize(10);
        }
        
        let dateStr = 'Unknown';
        if (exp.date) {
            const expDate = exp.date.toDate ? exp.date.toDate() : new Date(exp.date);
            dateStr = format(expDate, 'yyyy-MM-dd');
        }
        
        doc.text(dateStr, columnPositions.date, y);
        
        // Truncate long merchant names
        const merchant = exp.merchant || 'Unknown';
        const displayMerchant = merchant.length > 20 ? merchant.substring(0, 17) + '...' : merchant;
        doc.text(displayMerchant, columnPositions.merchant, y);
        
        // Category - might need to fetch names if they only store IDs, assuming names for now
        const categoryName = exp.categoryId || 'Uncategorized';
        doc.text(categoryName, columnPositions.category, y);
        
        // Format amount
        const amountStr = `${(exp.amount || 0).toFixed(2)} ${exp.currency || 'USD'}`;
        doc.text(amountStr, columnPositions.amount, y, { align: 'right', width: 90 });
        
        // Draw alternate background for rows
        if (i % 2 === 0) {
          doc.rect(45, y - 5, 510, 15).fillOpacity(0.05).fillAndStroke('gray', 'transparent');
          doc.fillOpacity(1).fillColor('black');
        }
        
        y += 20;
      }
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      console.error('Error generating PDF export:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  /**
   * Export expenses to Excel spreadsheet
   */
  async exportToExcel(userId, filters, res) {
    try {
      const { startDate, endDate, category, tripId } = filters;
      
      // Fetch data
      let expenses;
      if (tripId) {
        expenses = await expenseDal.getExpensesByTrip(userId, tripId);
      } else {
        expenses = await expenseDal.getExpensesByUser(userId, {
          startDate,
          endDate,
          category
        });
      }
      
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'BillVault';
      workbook.created = new Date();
      
      const worksheet = workbook.addWorksheet('Expenses');
      
      // Define columns
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Merchant', key: 'merchant', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Amount', key: 'amount', width: 15, style: { numFmt: '#,##0.00' } },
        { header: 'Currency', key: 'currency', width: 10 },
        { header: 'Source', key: 'source', width: 15 }
      ];
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add data rows
      expenses.forEach(exp => {
        let dateVal = null;
        if (exp.date) {
            dateVal = exp.date.toDate ? exp.date.toDate() : new Date(exp.date);
        }
        
        worksheet.addRow({
          date: dateVal,
          merchant: exp.merchant || '',
          category: exp.categoryId || 'Uncategorized',
          description: exp.description || '',
          amount: exp.amount || 0,
          currency: exp.currency || 'USD',
          source: exp.source || 'manual'
        });
      });
      
      // Write to response
      await workbook.xlsx.write(res);
      
    } catch (error) {
      console.error('Error generating Excel export:', error);
      throw new Error(`Failed to generate Excel: ${error.message}`);
    }
  }
}

module.exports = new ExportService();
