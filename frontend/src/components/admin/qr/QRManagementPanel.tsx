import { useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { buildingGraph } from '../../../data/graphData';
import { QRGrid } from './QRGrid';

export function QRManagementPanel() {
  const [search, setSearch] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');
  const [isPrinting, setIsPrinting] = useState(false);

  const filteredNodes = useMemo(() => {
    return buildingGraph.nodes.filter((node) => {
      const matchesSearch =
        node.id.toLowerCase().includes(search.toLowerCase()) ||
        (node.label && node.label.toLowerCase().includes(search.toLowerCase()));

      const matchesFloor = selectedFloor === 'all' || node.floor === selectedFloor;

      let matchesType = false;
      if (selectedType === 'all') {
        matchesType = node.type === 'qr' || node.type === 'exit';
      } else if (selectedType === 'qr') {
        matchesType = node.type === 'qr';
      } else if (selectedType === 'exit') {
        matchesType = node.type === 'exit';
      }

      return matchesSearch && matchesFloor && matchesType;
    });
  }, [search, selectedFloor, selectedType]);

  const handlePrintRegistry = async () => {
    if (filteredNodes.length === 0) return;
    setIsPrinting(true);

    try {
      const compiledNodes = await Promise.all(
        filteredNodes.map(async (node) => {
          try {
            const dataUrl = await QRCode.toDataURL(node.id, {
              width: 200,
              margin: 1,
              color: { dark: '#000000', light: '#ffffff' },
            });
            return { ...node, qrUrl: dataUrl };
          } catch (e) {
            console.error(e);
            return { ...node, qrUrl: '' };
          }
        })
      );

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Popup blocker prevented printing. Please allow popups for this site.');
        setIsPrinting(false);
        return;
      }

      let cardsHtml = '';
      compiledNodes.forEach((n) => {
        const floorLabels = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];
        const typeLabel = n.type === 'exit' ? 'VERIFIED BUILDING EXIT' : 'EMERGENCY CHECKPOINT';
        
        cardsHtml += `
          <div class="qr-print-card">
            <div class="card-header">${typeLabel}</div>
            <div class="card-title">${n.label || 'Corridor Checkpoint'}</div>
            <div class="card-sub">LEVEL ${n.floor} (${floorLabels[n.floor] || 'Corridor'}) &bull; NODE: ${n.id}</div>
            <img src="${n.qrUrl}" alt="${n.id}" class="card-img" />
            <div class="card-footer">▲ EXOA INDOOR NAVIGATION SYSTEM ▲</div>
          </div>
        `;
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>EXOA QR Print Registry</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
                background: #ffffff;
                color: #000000;
                margin: 0;
                padding: 30px;
                -webkit-print-color-adjust: exact;
              }
              .header {
                text-align: center;
                border-bottom: 3px double #000000;
                padding-bottom: 12px;
                margin-bottom: 25px;
              }
              .title {
                font-size: 22px;
                font-weight: 900;
                letter-spacing: 3px;
                margin: 0;
              }
              .subtitle {
                font-size: 9px;
                font-weight: bold;
                letter-spacing: 2px;
                margin-top: 6px;
                color: #555555;
              }
              .grid {
                display: grid;
                grid-template-cols: repeat(3, 1fr);
                gap: 20px;
              }
              .qr-print-card {
                border: 2px solid #000000;
                border-radius: 12px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                page-break-inside: avoid;
              }
              .card-header {
                font-size: 7px;
                font-weight: bold;
                letter-spacing: 1px;
                color: #555555;
                margin-bottom: 6px;
                border-bottom: 1px solid #ddd;
                width: 100%;
                padding-bottom: 4px;
              }
              .card-title {
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                margin-top: 2px;
                margin-bottom: 2px;
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .card-sub {
                font-size: 7px;
                font-family: monospace;
                color: #444444;
                margin-bottom: 12px;
              }
              .card-img {
                width: 130px;
                height: 130px;
                border: 1px solid #eaeaea;
                padding: 4px;
                border-radius: 4px;
              }
              .card-footer {
                font-size: 6px;
                font-weight: bold;
                letter-spacing: 1px;
                margin-top: 10px;
                color: #777777;
              }
              @media print {
                body { padding: 0; }
                .grid { gap: 15px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">EXOA SAFETY DIRECTORY REGISTER</div>
              <div class="subtitle">PHYSICAL STICKER MARKER CARD INDEX • PRINT ONLY</div>
            </div>
            <div class="grid">
              ${cardsHtml}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Failed to compile print layout:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans text-slate-800">
      {/* Control Console header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">QR Checkpoint Directory</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
            Displaying {filteredNodes.length} mapped check-points of {buildingGraph.nodes.length} total nodes
          </p>
        </div>

        {/* Print Console action */}
        <button
          onClick={handlePrintRegistry}
          disabled={isPrinting || filteredNodes.length === 0}
          className={`px-5 py-2.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100/80 text-blue-600 font-bold text-[9px] tracking-wider uppercase cursor-pointer transition-all flex items-center gap-2 shadow-sm ${
            isPrinting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isPrinting ? (
            <>
              <div className="w-3 h-3 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              Precompiling labels...
            </>
          ) : (
            <>🖨️ Print Label Sheets ({filteredNodes.length})</>
          )}
        </button>
      </div>

      {/* Filter and Search HUD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        {/* Search */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <label className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
            Filter Text Query
          </label>
          <input
            type="text"
            placeholder="Search by Room label, ID, Floor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4.5 py-2.5 rounded-full text-xs font-semibold focus:outline-none focus:border-blue-500/50 shadow-inner placeholder-slate-400 text-slate-700 transition-all"
          />
        </div>

        {/* Floor Level Filter */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <label className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
            Floor Category
          </label>
          <div className="flex bg-slate-50 border border-slate-200 rounded-full p-1 w-full justify-between gap-1 select-none">
            {['ALL', 'GF', '1F', '2F', '3F'].map((label) => {
              const val = label === 'ALL' ? 'all' : label === 'GF' ? 0 : label === '1F' ? 1 : label === '2F' ? 2 : 3;
              const active = selectedFloor === val;
              return (
                <button
                  key={label}
                  onClick={() => setSelectedFloor(val)}
                  className={`flex-grow py-1 rounded-full text-[9px] font-bold tracking-wider cursor-pointer transition-all ${
                    active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Node Type Filter */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <label className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
            Component Classification
          </label>
          <div className="flex bg-slate-50 border border-slate-200 rounded-full p-1 w-full justify-between gap-1 select-none">
            {['ALL', 'CHECKPOINTS', 'EXITS'].map((label) => {
              const val = label === 'ALL' ? 'all' : label === 'CHECKPOINTS' ? 'qr' : 'exit';
              const active = selectedType === val;
              return (
                <button
                  key={label}
                  onClick={() => setSelectedType(val)}
                  className={`flex-grow py-1 rounded-full text-[9px] font-bold tracking-wider cursor-pointer transition-all ${
                    active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid displaying the nodes */}
      <div className="mt-4">
        <QRGrid nodes={filteredNodes} />
      </div>
    </div>
  );
}

export default QRManagementPanel;
