import { useEffect } from "react";
import { useState } from "react";
import { CSVLink } from "react-csv";
import { getParsedText } from "../services/getParsedText";
import { extractInfoFromText } from "../utils/utils";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [base64IMG, setBase64IMG] = useState();
  const [ticketInformation, setTicketInformation] = useState(null);

  // Convert image to base64
  const convertToBase64 = (event) => {
    const img = event.target.files[0];
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
  // and extract data from it to generate excel file
  const generateExcel = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      // Call API to get parsed text from the base64 image
      const parsedText = await getParsedText(base64IMG);

      // Get data and products from text
      const final = extractInfoFromText(parsedText);

      // Prepare data for CSV download
      setTicketInformation({
        productList: final.productList,
        headers: [
          { label: "Detalle", key: "name" },
          { label: "Cantidad", key: "quantity" },
          { label: "Precio", key: "price" },
          { label: "Total", key: "total" },
        ],
      });
    } catch (error) {
      console.error("Error reconociendo texto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ticketInformation &&
      console.log("ticketInformation -----> ", ticketInformation);
  }, [ticketInformation]);

  return (
    <div>
      <h1 className="text-3xl mb-4">Ticket to Excel</h1>
      <form className="flex flex-col gap-2" onSubmit={generateExcel}>
        <input
          className="border-2 py-2 px-4 rounded-4xl cursor-pointer"
          type="file"
          onChange={convertToBase64}
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

        {ticketInformation && (
          <CSVLink
            data={ticketInformation.productList}
            headers={ticketInformation.headers}
            separator={";"}
          >
            Download me
          </CSVLink>
        )}
      </form>
    </div>
  );
}
