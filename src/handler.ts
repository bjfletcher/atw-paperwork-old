import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

import pdfFiller from 'pdffiller-aws-lambda';
import { parse } from 'querystring';
import uuidv4 from 'uuid/v4';
import { readFileSync, unlinkSync } from 'fs';
import FormFields from './form-fields';
import formToPdf from './form-to-pdf';
import { SupportWorker, TravelToWork } from './pdf-fields';

export const makePdf: APIGatewayProxyHandler = async (event, _context) => {
  const body = new Buffer(event.body, 'base64').toString();
  const formFields: FormFields = <any> parse(body);
  const generatedPdf = `/tmp/atw-claim-form-${formFields["claim-type"]}-${uuidv4()}.pdf`;

  try {
    await fillForm(claimFormPdfs[formFields["claim-type"]], generatedPdf, formToPdf(formFields));

    const body = readFileSync(generatedPdf, { encoding: 'base64' });

    unlinkSync(generatedPdf);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="atw-claim-form-${formFields["claim-type"]}-${formFields["claim-from"]}.pdf"`
      },
      body,
      isBase64Encoded: true
    };
  } catch (err) {
    try {
      unlinkSync(generatedPdf);
    } catch (e) {
      // just in case it got half made or something... be safe
    }
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    };
  }
};

const claimFormPdfs = {
  support: "pdf/DP222JP-claim-form-editable.pdf",
  travel: "pdf/DP226JP-claim-form-editable.pdf"
};

const fillForm = async (pdf: string, dest: string, fieldsData: SupportWorker | TravelToWork) => {
  return new Promise((resolve, reject) => {
    pdfFiller.fillForm(pdf, dest, fieldsData, (err: any) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
