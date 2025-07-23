import axios from "axios";
import { useState } from "react";

const API_KEY = "K89732725588957";

const clean = (str) => (str ? str.replaceAll("\t", " ") : "");

const formatText = (text) => {
  const linesArray = text.split("\t\r\n");
  linesArray.forEach((item) => console.log(item));

  const date = clean(linesArray.find((item) => item.match("Vigo")));

  const startOfProductsIndex = linesArray.findIndex((item) =>
    item.match("IMPORTE")
  );

  const totalIndex = linesArray.findIndex((item) => item.match("Total"));
  const total = linesArray[totalIndex].split("\t")[1];
  console.log(total);

  const productsNoFormat = linesArray.slice(
    startOfProductsIndex + 1,
    totalIndex
  );

  const products = productsNoFormat.reduce((acc, curr, i, arr) => {
    if (i % 2 === 0 && arr[i + 1] !== undefined) {
      acc.push({ name: clean(curr), product: arr[i + 1] });
    }
    return acc;
  }, []);

  const productList = products.map((item) => {
    const data = item.product.split("\t");
    if (data.length === 3) data.unshift("*");

    return {
      name: item.name,
      quantity: data[1],
      price: data[2],
      total: data[3],
    };
  });

  const final = {
    market: "Froiz",
    date,
    total,
    productList,
  };

  return final;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [base64IMG, setBase64IMG] = useState();
  const [text, setText] = useState("");

  // Upload image handler and calls convertToBase64
  const uploadImage = (event) => {
    // const img = URL.createObjectURL(event.target.files[0]);
    const image = event.target.files[0];
    convertToBase64(image);
  };

  // Convert image to base64
  const convertToBase64 = (img) => {
    const reader = new FileReader();
    reader.readAsDataURL(img);

    reader.onload = () => {
      // console.log("called: ", reader);
      setBase64IMG(reader.result);
    };
    reader.onerror = (error) => {
      console.error("Error converting image to base64:", error);
    };
  };

  // Recognize text from the base64 image using OCR API
  const recognizeText = async () => {
    try {
      setLoading(true);

      const body = `base64Image=${encodeURIComponent(
        base64IMG
      )}&language=spa&isTable=true&OCREngine=2`;

      // Petición a la API de OCR
      const url = "https://api.ocr.space/parse/image";
      const headers = {
        apikey: API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      };

      const response = await axios.post(url, body, { headers });

      if (response.status !== 200) {
        throw new Error("Error en la solicitud a la API de OCR");
      }

      // console.log("response.data -----> ", response.data);
      const { data } = response;

      const parsedText = data.ParsedResults?.[0]?.ParsedText || "";

      const final = formatText(parsedText);
      setText(JSON.stringify(final, null, 2));
    } catch (error) {
      console.error("Error reconociendo texto:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    recognizeText();
  };

  return (
    <div>
      <h1 className="text-3xl mb-4">Ticket to Excel</h1>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          className="border-2 py-2 px-4 rounded-4xl cursor-pointer"
          type="file"
          onChange={uploadImage}
        />

        {loading && <div className="text-center text-blue-500">Loading...</div>}

        {base64IMG && (
          <>
            <div className="w-[500px] h-[500px] my-4 border-2 border-dashed">
              <img
                className="w-full h-full object-contain"
                src={base64IMG}
                alt="Uploaded image"
              />
            </div>
            <button
              className="border-2 py-2 px-4 rounded-4xl cursor-pointer"
              type="submit"
            >
              Convert to Excel
            </button>
          </>
        )}

        {text && (
          <div className="mt-4 p-4 border-2 rounded-lg bg-gray-600 text-white">
            <pre className="whitespace-pre-wrap">{text}</pre>
          </div>
        )}
      </form>
    </div>
  );
}
