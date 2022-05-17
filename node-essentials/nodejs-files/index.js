const fs = require("fs").promises;
const path = require("path");

async function main() {
  const salesDir = path.join(__dirname, "stores");
  const salesTotalDir = path.join(__dirname, "salesTotals");

  try {
    await fs.mkdir(salesTotalDir);
  } catch {
    console.log(`${salesTotalDir}`);
  }
  const salesFiles = await findStoreFiles(salesDir);
  const salesTotal = await calculateSalesTotal(salesFiles);

  const report = {
    salesTotal,
    totalStores: salesFiles.length,
  };

  const reportPath = path.join(salesTotalDir, "report.json");
  try {
    await fs.unlink(reportPath);
    console.log(`existing content removed from file ${salesTotalDir}`);
  } catch {
    console.log(`fail to remove ${salesTotalDir}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`sales report written to ${salesTotalDir}`);
}

main();

async function findStoreFiles(folderName) {
  let salesFiles = [];

  const items = await fs.readdir(folderName, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      salesFiles = salesFiles.concat(
        await findStoreFiles(path.join(folderName, item.name))
      );
    } else {
      if (path.extname(item.name) === ".json") {
        salesFiles.push(path.join(folderName, item.name));
      }
    }
  }
  return salesFiles;
}

async function calculateSalesTotal(salesFiles) {
  let salesTotal = 0;
  for (file of salesFiles) {
    const data = JSON.parse(await fs.readFile(file));
    salesTotal += data.total;
  }
  return salesTotal;
}
