import { Response, Request } from 'express';
import { handleHTTPError } from '../utils/handleError';
import XLSX from 'xlsx';
import { db } from '../firebase/db';

const updateShopifyMargin = async (req: Request, res: Response) => {
  try {
    const { file } = req;
    if (!file) return handleHTTPError(res, 'ERROR_NO_FILE_UPLOADED', 400);

    const fileExtension = file.originalname
      .split('.')
      .pop()
      ?.toLocaleLowerCase();

    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      return handleHTTPError(res, 'ERROR_FILE_FORMAT_NOT_SUPPORTED', 400);
    }

    const excelBuffer = file.buffer;

    const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      header: ['sku', 'shopify_margin', 'supplier_code'],
      range: 1,
    });

    const isValidDataArray = (data: unknown[]): boolean => {
      return (
        Array.isArray(data) &&
        data.every((item) => {
          if (!item) return false;

          return (
            typeof item === 'object' &&
            Object.keys(item).length === 3 &&
            'sku' in item &&
            'shopify_margin' in item &&
            'supplier_code' in item
          );
        })
      );
    };

    console.log(jsonData);

    if (!isValidDataArray(jsonData))
      return handleHTTPError(res, 'ERROR_INVALID_DATA', 400);

    type Item = {
      sku: string;
      shopify_margin: string | number;
      supplier_code: string;
    };

    type productNotFound = {
      product: Item;
      warning: string;
      error?: string;
    };

    let hasWarnings = false;
    const productsNotFound: productNotFound[] = [];

    const data = jsonData.map(async (item) => {
      const { sku, shopify_margin, supplier_code } = item as Item;
      if (!sku || !shopify_margin || !supplier_code) return;
      const snap = await db
        .collection('products')
        .where('sku', '==', sku)
        .get();
      if (snap.empty) {
        hasWarnings = true;
        productsNotFound.push({
          product: item as Item,
          warning: `Product with sku ${sku} not found`,
        });
        return console.log(`Product with sku ${sku} not found`);
      }
      const product = await snap.docs[0].ref
        .collection('suppliers')
        .doc(supplier_code)
        .get();
      if (!product.exists) {
        hasWarnings = true;
        productsNotFound.push({
          product: item as Item,
          warning: `Product with sku ${sku} and supplier code ${supplier_code} not found`,
        });
        return console.log(
          `Product with sku ${sku} and supplier code ${supplier_code} not found`,
        );
      }

      await product.ref
        .update({ shopify_margin })
        .then(async () => {
          const price_best_mxn = product.get('price_best_mxn');
          if (price_best_mxn) {
            const price_shopify: number =
              Number(price_best_mxn) * (1 + Number(shopify_margin) / 100);
            await product.ref
              .update({ price_shopify: price_shopify.toFixed(2) })
              .catch((error) => {
                hasWarnings = true;
                productsNotFound.push({
                  product: item as Item,
                  warning: `Product with sku ${sku} and supplier code ${supplier_code} could not be updated`,
                  error: error.message,
                });
                return console.log(
                  `Product with sku ${sku} and supplier code ${supplier_code} could not be updated`,
                );
              });
          }
          console.log(
            `Product with sku ${sku} and supplier code ${supplier_code} updated`,
          );
        })
        .catch((error) => {
          hasWarnings = true;
          productsNotFound.push({
            product: item as Item,
            warning: `Product with sku ${sku} and supplier code ${supplier_code} could not be updated`,
            error: error.message,
          });
          console.log(
            `Product with sku ${sku} and supplier code ${supplier_code} could not be updated`,
          );
        });
    });

    await Promise.all(data);

    res.status(200).json({
      hasWarnings,
      message: hasWarnings
        ? 'Some products were not found'
        : 'All products were updated',
      productsNotFound,
    });

    res.end();
  } catch (error) {
    handleHTTPError(res, 'ERROR_UPDATING_SHOPIFY_MARGIN', 500, error);
  }
};

export default { updateShopifyMargin };
