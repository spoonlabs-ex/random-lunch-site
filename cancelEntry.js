const { getEntries, getSheetConfig, getSheetsApi, makeJsonResponse } = require('./_sheet');

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return makeJsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return makeJsonResponse(405, { message: 'POST 요청만 허용됩니다.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const id = String(body.id || '').trim();
    const name = String(body.name || '').trim();

    if (!id && !name) {
      return makeJsonResponse(400, { message: '취소 대상이 없습니다.' });
    }

    const sheets = await getSheetsApi();
    const { spreadsheetId, sheetName } = getSheetConfig();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:E`,
    });

    const rows = response.data.values || [];
    let targetIndex = -1;

    rows.forEach((row, index) => {
      const rowId = row[0] || '';
      const rowName = row[1] || '';
      const rowStatus = row[3] || 'active';
      const matched = id ? rowId === id : rowName.toLowerCase() === name.toLowerCase();
      if (matched && rowStatus !== 'cancelled' && targetIndex === -1) {
        targetIndex = index + 2;
      }
    });

    if (targetIndex === -1) {
      return makeJsonResponse(404, { message: '취소할 신청 내역을 찾지 못했습니다.' });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!D${targetIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['cancelled']],
      },
    });

    const entries = await getEntries();
    return makeJsonResponse(200, { entries });
  } catch (error) {
    return makeJsonResponse(500, {
      message: error.message || '신청 취소 중 오류가 발생했습니다.',
    });
  }
};
