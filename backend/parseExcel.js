const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function parseExcelFile() {
  try {
    const excelPath = '../INTERNAL Facebook for Creators _ Master Creator List.xlsx';
    const workbook = XLSX.readFile(excelPath);
    
    // Get all sheet names
    const sheetNames = workbook.SheetNames;
    console.log('Available sheets:', sheetNames);
    
    // Read the first sheet
    const firstSheet = workbook.Sheets[sheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet);
    
    console.log('Number of rows:', data.length);
    console.log('First few rows:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
    
    // Save parsed data to a JSON file for inspection
    fs.writeFileSync('parsed_creators.json', JSON.stringify(data, null, 2));
    console.log('Saved parsed data to parsed_creators.json');
    
  } catch (error) {
    console.error('Error parsing Excel file:', error.message);
  }
}

parseExcelFile();