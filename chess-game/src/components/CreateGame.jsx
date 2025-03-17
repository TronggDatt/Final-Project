// import React, { useState } from "react";
// import { createGame } from "./GameController";

// const CreateGame = () => {
//   const [boardState, setBoardState] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newGame = await createGame({ boardState });
//     if (newGame) {
//       alert("Game created successfully!");
//     } else {
//       alert("Failed to create game.");
//     }
//   };

//   return (
//     <div>
//       <h2>Tạo ván cờ mới</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Nhập trạng thái bàn cờ"
//           value={boardState}
//           onChange={(e) => setBoardState(e.target.value)}
//           required
//         />
//         <button type="submit">Tạo Game</button>
//       </form>
//     </div>
//   );
// };

// export default CreateGame;
