import axios from "axios";

const API_KEY = "K89732725588957";

// Petition to OCR's API
export const getParsedText = async (base64IMG) => {
  const url = "https://api.ocr.space/parse/image";

  const body = `base64Image=${encodeURIComponent(
    base64IMG
  )}&language=spa&isTable=true&OCREngine=2`;

  const headers = {
    apikey: API_KEY,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const response = await axios.post(url, body, { headers });

  if (response.status !== 200) {
    throw new Error("Error en la solicitud a la API de OCR");
  }

  const { data } = response;
  const parsedText = data.ParsedResults?.[0]?.ParsedText || "";
  return parsedText;
};
