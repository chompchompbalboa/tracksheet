//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import { batch } from 'react-redux'

import { IAppState } from '@app/state'
import { IThunkAction, IThunkDispatch } from '@app/state/types'
import { 
  ISheet,
  ISheetCell
} from '@app/state/sheet/types'

import { 
  selectSheetColumns, 
  selectSheetRows, 
  updateSheet, updateSheetCellReducer 
} from '@app/state/sheet/actions'

import { defaultSheetSelections } from '@app/state/sheet/defaults'

//-----------------------------------------------------------------------------
// Action
//-----------------------------------------------------------------------------
export const updateSheetSelectionFromArrowKey = (sheetId: ISheet['id'], cellId: ISheetCell['id'], moveDirection: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT'): IThunkAction => {
  return async (dispatch: IThunkDispatch, getState: () => IAppState) => {
    const {
      allSheetCells,
      allSheetRows,
      allSheets: { 
        [sheetId]: {
          visibleColumns,
          visibleRows,
          selections
        }
      }
    } = getState().sheet

    // Cell
    const cell = allSheetCells[cellId]

    if(selections.isOneEntireRowSelected && (moveDirection === 'UP' || moveDirection === 'DOWN')) {
      const selectedRowId = selections.rangeStartRowId
      const moveDirectionModifier = moveDirection === 'UP' ? -1 : 1
      const nextSelectedRowIndex = Math.min(visibleRows.length - 1, Math.max(0, visibleRows.indexOf(selectedRowId) + moveDirectionModifier))
      const nextSelectedRowId = visibleRows[nextSelectedRowIndex] !== 'ROW_BREAK' ? visibleRows[nextSelectedRowIndex] : visibleRows[Math.min(visibleRows.length - 2, Math.max(0, nextSelectedRowIndex + moveDirectionModifier))]
      dispatch(selectSheetRows(sheetId, nextSelectedRowId))
    }

    else if(selections.isOneEntireColumnSelected && (moveDirection === 'RIGHT' || moveDirection === 'LEFT')) {
      const selectedColumnId = selections.rangeStartColumnId
      const moveDirectionModifier = moveDirection === 'LEFT' ? -1 : 1
      const nextSelectedColumnIndex = Math.min(visibleColumns.length - 1, Math.max(0, visibleColumns.indexOf(selectedColumnId) + moveDirectionModifier))
      const nextSelectedColumnId = visibleColumns[nextSelectedColumnIndex] !== 'COLUMN_BREAK' ? visibleColumns[nextSelectedColumnIndex] : visibleColumns[Math.min(visibleColumns.length - 1, Math.max(0, nextSelectedColumnIndex + moveDirectionModifier))]
      dispatch(selectSheetColumns(sheetId, nextSelectedColumnId))
    }
    
    else {
      // Column and row indexes
      const selectedCellColumnIndex = visibleColumns.indexOf(cell.columnId)
      const selectedCellRowIndex = visibleRows.indexOf(cell.rowId)
  
      // Next column and row indexes
      let nextSelectedCellColumnIndex = Math.min(visibleColumns.length - 1, Math.max(0,
        !['RIGHT', 'LEFT'].includes(moveDirection) 
          ? selectedCellColumnIndex 
          : (moveDirection === 'RIGHT' ? selectedCellColumnIndex + 1 : selectedCellColumnIndex - 1)
      ))
      let nextSelectedCellRowIndex = Math.min(visibleRows.length - 1, Math.max(0,
        !['UP', 'DOWN'].includes(moveDirection) 
          ? selectedCellRowIndex 
          : (moveDirection === 'UP' ? selectedCellRowIndex - 1 : selectedCellRowIndex + 1)
      ))
  
      // Next column and row ids
      let nextSelectedCellRowId = visibleRows[nextSelectedCellRowIndex]
      while(nextSelectedCellRowId === 'ROW_BREAK') { // Row breaks are not selectable, skip over them
        nextSelectedCellRowIndex = Math.min(visibleRows.length, Math.max(0, (moveDirection === 'UP' ? nextSelectedCellRowIndex - 1 : nextSelectedCellRowIndex + 1)))
        nextSelectedCellRowId = visibleRows[nextSelectedCellRowIndex]
      }
      let nextSelectedCellColumnId = visibleColumns[nextSelectedCellColumnIndex]
      while(nextSelectedCellColumnId === 'COLUMN_BREAK') { // Column breaks are not selectable, skip over them
        nextSelectedCellColumnIndex = Math.min(visibleColumns.length - 1, Math.max(0, (moveDirection === 'RIGHT' ? nextSelectedCellColumnIndex + 1 : nextSelectedCellColumnIndex - 1)))
        nextSelectedCellColumnId = visibleColumns[nextSelectedCellColumnIndex]
      }
  
      // Next row and cell
      const nextSelectedCellRow = allSheetRows[nextSelectedCellRowId]
      const nextSelectedCell = nextSelectedCellRow ? allSheetCells[nextSelectedCellRow.cells[nextSelectedCellColumnId]] : null
  
      // If we selected a cell, update the sheet state
      if(nextSelectedCell !== null) {
        batch(() => {
          // Clear the current selections
          if(selections.rangeStartCellId) {
            const rangeStartCell = allSheetCells[selections.rangeStartCellId]
            const nextIsCellSelectedSheetIds = new Set([ ...rangeStartCell.isCellSelectedSheetIds ])
            nextIsCellSelectedSheetIds.delete(sheetId)
            dispatch(updateSheetCellReducer(selections.rangeStartCellId, {
              isCellSelectedSheetIds: nextIsCellSelectedSheetIds
            }))
          } 
          // Reset selection state
          dispatch(updateSheet(sheetId, {
            selections: {
              ...defaultSheetSelections,
              rangeStartColumnId: nextSelectedCell.columnId, 
              rangeStartRowId: nextSelectedCell.rowId, 
              rangeStartCellId: nextSelectedCell.id
            }
          }, true))
          // Update the next selected cell
          dispatch(updateSheetCellReducer(nextSelectedCell.id, {
            isCellSelectedSheetIds: new Set([ sheetId, ...nextSelectedCell.isCellSelectedSheetIds ])
          }))
        })
      }
    }
  }
}