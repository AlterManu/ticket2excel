const clean = (str) => (str ? str.replaceAll("\t", " ") : "");

export const extractInfoFromText = (text) => {
  const linesArray = text.split("\t\r\n");
  //   linesArray.forEach((item) => console.log(item));

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

  // get product list
  const products = productsNoFormat.reduce((acc, curr, i, arr) => {
    if (i % 2 === 0 && arr[i + 1] !== undefined) {
      acc.push({ name: clean(curr), product: arr[i + 1] });
    }
    return acc;
  }, []);

  // clean product list to get final list
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

  productList.push({});

  productList.push({
    name: date,
    total: total.split(" ")[0],
  });

  return {
    market: "Froiz",
    date,
    total,
    productList,
  };
};
