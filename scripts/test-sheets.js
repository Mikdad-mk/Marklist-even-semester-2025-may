const { appendToSheet, setupSheet } = require('../src/lib/googleSheets');

async function testGoogleSheets() {
  try {
    console.log('1. Testing Google Sheets setup...');
    await setupSheet();
    console.log('✓ Sheet setup successful!');

    console.log('\n2. Testing data append...');
    const testData = {
      studentName: 'Test Student',
      admissionNumber: 'TEST001',
      class: 'Test Class',
      subject: 'Test Subject',
      ce: 25,
      te: 60,
      total: 85,
      result: 'Pass',
      submittedAt: new Date().toISOString()
    };

    await appendToSheet(testData);
    console.log('✓ Successfully appended test data to sheet!');
    
    console.log('\n✅ All tests passed! Google Sheets integration is working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error.message && error.message.includes('credentials')) {
      console.error('\nPossible issues:');
      console.error('1. Missing or invalid environment variables');
      console.error('2. Incorrect service account credentials');
      console.error('3. Google Sheets API not enabled');
      console.error('\nPlease check your .env file and Google Cloud Console settings.');
    }
    process.exit(1);
  }
}

testGoogleSheets(); 