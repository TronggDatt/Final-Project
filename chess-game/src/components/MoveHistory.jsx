const MoveHistory = ({ moveHistory = [] }) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-white text-lg font-bold mb-2">Lịch sử nước đi</h2>
      <table className="w-full text-white border-collapse">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-2">#</th>
            <th className="p-2">Đỏ</th>
            <th className="p-2">Đen</th>
          </tr>
        </thead>
        <tbody>
          {moveHistory.map((move, index) => (
            <tr key={index} className="border-b border-gray-600">
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2 text-center">{move.redMove}</td>
              <td className="p-2 text-center">{move.blackMove}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MoveHistory;
