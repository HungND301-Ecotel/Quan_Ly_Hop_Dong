import {
  MaterialUnitPriceReportContract,
  MaterialUnitPriceReportYear,
} from '@/services/contract-payment/type';

const S = {
  th: {
    border: '1px solid #000',
    padding: '4px 6px',
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    background: '#ffffff',
  },
  thSub: {
    border: '1px solid #000',
    padding: '3px 6px',
    fontSize: 8,
    fontWeight: 600,
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    background: '#ffffff',
  },
  td: {
    border: '1px solid #999',
    padding: '3px 6px',
    fontSize: 8,
    verticalAlign: 'middle' as const,
  },
  tdC: {
    border: '1px solid #999',
    padding: '3px 6px',
    fontSize: 8,
    verticalAlign: 'middle' as const,
    textAlign: 'center' as const,
  },
  tdR: {
    border: '1px solid #999',
    padding: '3px 6px',
    fontSize: 8,
    verticalAlign: 'middle' as const,
    textAlign: 'right' as const,
  },
  year: {
    fontSize: 9,
    fontWeight: 700,
    margin: '6px 0 4px',
  },
} as const;

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n));

type ContractColumn = MaterialUnitPriceReportContract & { key: string };

interface MaterialUnitPriceTableProps {
  years: MaterialUnitPriceReportYear[];
}

function buildContractColumns(year: MaterialUnitPriceReportYear) {
  const map = new Map<string, ContractColumn>();
  year.materials.forEach((m) => {
    m.contracts.forEach((c) => {
      const key = c.contractId || c.contractCode;
      if (!map.has(key)) {
        map.set(key, { ...c, key });
      }
    });
  });
  return Array.from(map.values());
}

export function MaterialUnitPriceTable({ years }: MaterialUnitPriceTableProps) {
  if (!years.length) {
    return (
      <div style={{ padding: '12px 8px', fontSize: 9, color: '#888' }}>
        Không có dữ liệu phù hợp
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {years.map((year) => {
        const columns = buildContractColumns(year);
        return (
          <div key={year.year}>
            <div style={S.year}>Năm {year.year}</div>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  minWidth: Math.max(980, 240 + columns.length * 120),
                }}
              >
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ ...S.th, minWidth: 220 }}>
                      Vật tư
                    </th>
                    {columns.map((c) => (
                      <th key={`${year.year}-${c.key}`} style={S.th}>
                        {c.contractCode}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {columns.map((c) => (
                      <th key={`${year.year}-${c.key}-title`} style={S.thSub}>
                        {c.contractTitle || ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {year.materials.map((m) => {
                    const contractMap = new Map(
                      m.contracts.map((c) => [c.contractId || c.contractCode, c])
                    );
                    return (
                      <tr key={`${year.year}-${m.materialCode}-${m.materialName}`}>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600 }}>{m.materialName}</div>
                          <div style={{ fontSize: 7, color: '#555' }}>
                            {m.materialCode} - {m.unitOfMeasureName}
                          </div>
                        </td>
                        {columns.map((c) => {
                          const cell = contractMap.get(c.key);
                          return (
                            <td key={`${year.year}-${m.materialCode}-${c.key}`} style={S.tdR}>
                              {cell?.unitPrice ? fmt(cell.unitPrice) : ''}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {year.materials.length === 0 && (
                    <tr>
                      <td
                        colSpan={Math.max(1, columns.length + 1)}
                        style={{ ...S.tdC, padding: '12px 8px', color: '#888' }}
                      >
                        Không có dữ liệu phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
