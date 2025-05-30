import { setupSheet } from '../src/lib/googleSheets';

async function main() {
  try {
    console.log('Setting up Google Sheets integration...');
    await setupSheet();
    console.log('Successfully set up Google Sheets!');
  } catch (error) {
    console.error('Failed to set up Google Sheets:', error);
    process.exit(1);
  }
}

main(); 