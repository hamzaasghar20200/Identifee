import IdfTooltip from '../idfComponents/idfTooltip';
import ButtonIcon from '../commons/ButtonIcon';
import ButtonIconDropdownWrapper from '../commons/ButtonIconDropdownWrapper';
import React from 'react';
import { getReportName } from './reports.helper.functions';

const DownloadReportDropdown = ({
  report,
  startDownload,
  setStartDownload,
  downloadOptions,
  exportToCSV,
  csvData,
}) => {
  return (
    <ButtonIconDropdownWrapper
      options={downloadOptions}
      styleClasses="border-0 no-hover"
      handleOptionSelect={(itemClicked) => {
        const getHeightFromWidth = (width) => {
          const aspectRatio = 8.5 / 11; // Letter paper size aspect ratio
          const height = width / aspectRatio;
          return Math.round(height);
        };
        if (itemClicked.key === 'downloadAsPdf') {
          setStartDownload(true);
          setTimeout(() => {
            const $canvas = document.getElementById('rptPdf');
            const configWidth = $canvas?.getBoundingClientRect();
            const HTML_Width = configWidth?.width;
            // const HTML_Height = configWidth.height;
            // const top_left_margin = 2;
            window.scrollTo(0, 0);
            const calculatedPageHeight = getHeightFromWidth(HTML_Width);
            const pageHeight =
              calculatedPageHeight < 892 ? 892 : calculatedPageHeight;

            // const heightLeft = pageHeight;
            // eslint-disable-next-line new-cap
            const pdf = new window.jspdf.jsPDF('p', 'pt', [
              HTML_Width,
              pageHeight,
            ]);

            const canvases = [
              ...document.querySelectorAll('#rptPdf > div.px-0'),
            ].map((el) => {
              return window.html2canvas(el, {
                allowTaint: true,
                scale: 3,
                useCORS: true,
                removeContainer: true,
                imageTimeout: 15000,
              });
            });
            Promise.all(canvases).then((resps) => {
              resps.forEach((canvas, index) => {
                const imgData = canvas.toDataURL('image/jpeg', 1);
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, HTML_Width, 892);
              });
              pdf.deletePage(1);
              pdf.save(`${getReportName(report)}.pdf`);
              setStartDownload(false);
            });
          }, 100);
        } else {
          exportToCSV(csvData);
        }
      }}
    >
      <IdfTooltip text="Download">
        <ButtonIcon
          icon="file_download"
          color="white"
          loading={startDownload}
          classnames="btn-sm"
          label=""
        />
      </IdfTooltip>
    </ButtonIconDropdownWrapper>
  );
};
export default DownloadReportDropdown;
