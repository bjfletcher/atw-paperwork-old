import { CommonFields, SupportWorker, TravelToWork } from "./pdf-fields";
import FormFields from "./form-fields";

function commonFields (formFields: FormFields): CommonFields {
  const pdfFields: CommonFields = {};
  pdfFields["AtW ref number"] = formFields["ref-no"].toUpperCase();
  pdfFields["Email address"] = formFields.email;
  pdfFields.Surname = formFields["last-name"];
  pdfFields["Other names"] = formFields["first-name"];
  const [fromDate, fromMonth, fromYear] = formFields["claim-from"].split('-');
  pdfFields["From day"] = fromDate;
  pdfFields["From month"] = fromMonth;
  pdfFields["From year"] = fromYear;
  const [toDate, toMonth, toYear] = formFields["claim-to"].split('-');
  pdfFields["To day"] = toDate;
  pdfFields["To month"] = toMonth;
  pdfFields["To year"] = toYear;
  pdfFields["Their position"] = formFields.position;
  pdfFields["Their name"] = formFields.name;
  pdfFields["Company name and address"] = formFields.address;
  pdfFields["Payment made to"] = formFields["payment-to"];
  pdfFields["Your name"] = `${formFields["first-name"]} ${formFields["last-name"]}`;
  return pdfFields;
}

function supportWorkerFields (formFields: FormFields): SupportWorker {
  const pdfFields: SupportWorker = commonFields(formFields);

  let totalHours: number = 0;
  let totalCosts: number = 0;

  let pdfIndex: number = 1;
  for (let formIndex: number = 0; formIndex < 31; formIndex++) {
    const hours: string = formFields[`detail-hours-${formIndex}`];
    const costs: string = formFields[`detail-costs-${formIndex}`];
    if (hours && costs) {
      totalHours += parseInt(hours, 10);
      totalCosts += parseInt(costs, 10);
      pdfFields[`Date ${pdfIndex}`] = String(formIndex);
      pdfFields[`Hours claimed ${pdfIndex}`] = hours;
      pdfIndex++;
    }
  }

  pdfFields["Additional costs"] = '0';
  pdfFields["Amount claimed"] = String(totalCosts);
  pdfFields["Employer contribution"] = '0';
  pdfFields["Total costs"] = String(totalCosts);
  pdfFields["Total hours"] = String(totalHours);

  return pdfFields;
}

function travelToWorkFields (formFields: FormFields): TravelToWork {
  const pdfFields: TravelToWork = commonFields(formFields);

  let totalJourneys: number = 0;
  let totalCosts: number = 0;

  let pdfIndex: number = 1;
  for (let formIndex: number = 0; formIndex < 31; formIndex++) {
    const am: string = formFields[`detail-am-${formIndex}`];
    const pm: string = formFields[`detail-pm-${formIndex}`];
    if (am || pm) {
      pdfFields[`Date ${pdfIndex}`] = String(formIndex);
      pdfIndex++;
      if (am) {
        totalJourneys++;
        totalCosts += parseInt(am, 10);
      }
      if (pm) {
        totalJourneys++;
        totalCosts += parseInt(pm, 10);
      }
      if (am && pm) {
        pdfFields[`Claimed ${pdfIndex}`] = "2";
      } else {
        pdfFields[`Claimed ${pdfIndex}`] = "1";
      }
    }
  }

  pdfFields["How many days work each week"] = "5";
  pdfFields["Been at work all these days?"] = 'No';
  pdfFields["Total number of taxi journeys"] = String(totalJourneys);
  pdfFields["Total number of taxi journeys again"] = String(totalJourneys);
  pdfFields["Cost per journey or cost per mile"] = "(see attached)";
  pdfFields["Total cost"] = String(totalCosts);
  pdfFields["Your contribution"] = "0";
  pdfFields["Other contributions"] = "0";
  pdfFields["Amount claimed"] = String(totalCosts);

  return pdfFields;
}

export default function FormToPdf (formFields: FormFields): SupportWorker | TravelToWork {
  if (formFields["claim-type"] === 'support') {
    return supportWorkerFields(formFields);
  } else if (formFields["claim-type"] === 'travel') {
    return travelToWorkFields(formFields);
  } else {
    throw new Error(`we don\'t recognise your claim type ${formFields["claim-type"]}`);
  }
}