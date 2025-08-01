import { useEffect } from "react";
import { useState } from "react";
import { CSVLink } from "react-csv";
import { getParsedText } from "../services/getParsedText";
import {
  convertToBase64,
  extractInfoFromText,
  handleImageUpload,
} from "../utils/utils";
import DragAndDrop from "../components/DragAndDrop";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [ticketInformation, setTicketInformation] = useState(null);
  const [files, setFiles] = useState([]);

  // Recognize text from the base64 image using OCR API
  // and extract data from it to generate excel file
  const generateExcel = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      // Compress every image file before processing
      const compressedImages = await Promise.all(
        files.map((file) => handleImageUpload(file))
      );

      // Convert all selected files to base64
      const base64Array = await Promise.all(
        compressedImages.map((image) => convertToBase64(image))
      );

      // Call API to get parsed text from each base64 image
      const parsedTextArray = await Promise.all(
        base64Array.map((base64Img) => getParsedText(base64Img))
      );

      console.log("parsedTextArray -----> ", parsedTextArray);
      // const parsedText = await getParsedText(base64IMG);

      // Get data and products from text
      const finalArray = [];

      parsedTextArray.forEach((parsedText) => {
        const productList = extractInfoFromText(parsedText);
        finalArray.push(...productList);
      });

      console.log("finalArray -----> ", finalArray);

      // Prepare data for CSV download
      setTicketInformation({
        productList: finalArray,
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

  useEffect(() => {
    files && console.log("Files selected: ", files);
  }, [files]);

  return (
    <div>
      <h1 className="text-3xl mb-4">Ticket to Excel</h1>
      <form className="flex flex-col gap-2" onSubmit={generateExcel}>
        {loading && <div className="text-center text-blue-500">Loading...</div>}

        {files.length > 0 && (
          <>
            {files.map((file, index) => (
              <div
                className="w-[300px] h-[300px] my-4 border-2 border-dashed"
                key={index}
              >
                <img
                  className="w-full h-full object-contain"
                  src={URL.createObjectURL(file)}
                  alt={`file-${index}`}
                />
              </div>
            ))}

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

      <div className="section">
        <DragAndDrop onFilesSelected={setFiles} />
      </div>
    </div>
  );
}
