const API_URL = "https://www2.deepl.com/jsonrpc";
const DEFAULT_LANGUAGE = "AUTO";
const REQUEST_ALTERNATIVES = 3;

async function queryAPI(data) {
  const response = await fetch(API_URL, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    method: "POST",
    body: buildRequestBody(data),
  });

  if (response.ok) {
    const result = await response.json();
    return {
      id: result.id,
      code: 200,
      data: result.result.texts[0].text,
    };
  }

  return {
    id: 42,
    code: response.status,
    data:
      response.status === 429
        ? "Too many requests, please try again later."
        : "Unknown error.",
  };
}

function buildRequestParams(sourceLang, targetLang) {
  return {
    jsonrpc: "2.0",
    method: "LMT_handle_texts",
    id: Math.floor(Math.random() * 100000 + 100000) * 1000,
    params: {
      texts: [{ text: "", requestAlternatives: REQUEST_ALTERNATIVES }],
      timestamp: 0,
      splitting: "newlines",
      lang: {
        source_lang_user_selected: sourceLang,
        target_lang: targetLang,
      },
    },
  };
}

function countLetterI(translateText) {
  return translateText.split("i").length - 1;
}

function getTimestamp(letterCount) {
  const timestamp = new Date().getTime();
  return letterCount !== 0
    ? timestamp - (timestamp % (letterCount + 1)) + (letterCount + 1)
    : timestamp;
}

function buildRequestBody(data) {
  const requestData = buildRequestParams(
    data.source_lang || DEFAULT_LANGUAGE,
    data.target_lang || DEFAULT_LANGUAGE
  );
  requestData.params.texts = [
    { text: data.text, requestAlternatives: REQUEST_ALTERNATIVES },
  ];
  requestData.params.timestamp = getTimestamp(countLetterI(data.text));

  let requestString = JSON.stringify(requestData);
  if (
    [0, 3].includes((requestData["id"] + 5) % 29) ||
    (requestData["id"] + 3) % 13 === 0
  ) {
    requestString = requestString.replace('"method":"', '"method" : "');
  } else {
    requestString = requestString.replace('"method":"', '"method": "');
  }

  return requestString;
}

module.exports = async function (params) {
  return await queryAPI(params);
};
