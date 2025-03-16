const MoveHistory = ({ moveHistory = [] }) => {
  // Hàm xử lý tăng chỉ số
  const adjustMoveText = (text) => {
    if (!text) return "";
    return text.replace(/\((\d)(\d) -> (\d)(\d)\)/, (match, c1, r1, c2, r2) => {
      const col1 = parseInt(c1) + 1;
      const row1 = parseInt(r1) + 1;
      const col2 = parseInt(c2) + 1;
      const row2 = parseInt(r2) + 1;
      const separator = col1 === col2 ? " . " : " - ";
      return `${col1}${row1}${separator}${col2}${row2}`;
    });
  };
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-white text-lg font-bold mb-2">Moves</h2>
      <table className="w-full text-white border-collapse">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-2">#</th>
            <th className="p-2">Red</th>
            <th className="p-2">Black</th>
          </tr>
        </thead>
        <tbody>
          {moveHistory.map((move, index) => (
            <tr key={index} className="border-b border-gray-600">
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2 text-center">
                {adjustMoveText(move.redMove)}
              </td>
              <td className="p-2 text-center">
                {adjustMoveText(move.blackMove)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MoveHistory;
