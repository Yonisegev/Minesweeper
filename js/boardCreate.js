function buildBoard() {

    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell;

            cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }

    return board;
}

function renderBoard(mat) {

    var strHTML = ''
    for (var i = 0; i < mat.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];

            var className = ''
            var eventHandler = `onclick="cellClick(this, ${i}, ${j})"`;
            if (cell.isMine) {
                className = 'mine ';
            }

            if (!cell.isMine) className = 'tile';

            strHTML += `\t<td class="cell cell-${i}-${j} ${className}" oncontextmenu="cellMark(this, ${i}, ${j})"  ${eventHandler} >
            
                         </td>\n`
        }
        strHTML += `</tr>\n `
    }
    strHTML += `</tbody></table>`
    // console.log(strHTML)
    var elBoard = document.querySelector('.mine-board');
    elBoard.innerHTML = strHTML;

}
