// static hook based on url to do specific things for the below tenants
const useIsTenant = () => {
  const url = document.URL;
  const isValleyBank = /valleybank/.test(url);
  // adding isValleyBank because i dont have to make change in all other components wherever we are using execlbank
  const isExcelBank = isValleyBank || /excelbank/.test(url); // demo banks
  const isSynovusBank = /synovus/.test(url);
  const isCenturyBank = /centurybank/.test(url);
  const isComericaBank = /comerica/.test(url);
  const isSVB = /svb/.test(url);
  return {
    isExcelBank,
    isValleyBank,
    isSynovusBank,
    isCenturyBank,
    isComericaBank,
    isSVB,
  };
};

export default useIsTenant;
