using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public abstract class BasePiece : EventTrigger
{

    [HideInInspector]
    public Color mColor = Color.clear;

    protected Cell mOriginalCell = null;
    protected Cell mCurrentCell = null;

    protected RectTransform mRectTransform = null;
    protected PieceManager mPieceManager;

    // These will be changed for inheriting classes
    protected Vector3Int mMovement = Vector3Int.one;
    protected List<Cell> mHighlightedCells = new List<Cell>();

    public virtual void Setup(Color newTeamColor, Color32 newSpriteColor, PieceManager newPieceManager)
    {
        mPieceManager = newPieceManager;

        mColor = newTeamColor;
        GetComponent<Image>().color = newSpriteColor;
        mRectTransform = GetComponent<RectTransform>();
    }

    public void Place(Cell newCell)
    {
        // Set the current cell and original cell to the newCell that was passed in
        mCurrentCell = newCell;
        mOriginalCell = newCell;
        // the current cell's current piece is now equal to this piece
        mCurrentCell.mCurrentPiece = this;

        // this piece's transform position is now the cell's transform position
        transform.position = newCell.transform.position;
        gameObject.SetActive(true);
    }

    private void CreateCellPath(int xDirection, int yDirection, int movement)
    {
        // Target Position
        int currentX = mCurrentCell.mBoardPosition.x;
        int currentY = mCurrentCell.mBoardPosition.y;

        // Check Each Cell
        for (int i = 1; i <= movement; i++)
        {
            currentX += xDirection;
            currentY += yDirection;

            // TODO: Get the state of the target cell

            // Add the target cell to the list
            mHighlightedCells.Add(mCurrentCell.mBoard.mAllCells[currentX, currentY]);
        }
    }

    protected virtual void CheckPathing()
    {
        // Horizontal 
        CreateCellPath(1, 0, mMovement.x);
        CreateCellPath(-1, 0, mMovement.x);

        // Vertical 
        CreateCellPath(0, 1, mMovement.y);
        CreateCellPath(0, -1, mMovement.y);

        // Upper Diagonal 
        CreateCellPath(1, 1, mMovement.z);
        CreateCellPath(-1, 1, mMovement.z);

        // Lower Diagonal 
        CreateCellPath(1, -1, mMovement.z);
        CreateCellPath(-1, -1, mMovement.z);
    }

    protected void ShowCells()
    {
        foreach (Cell cell in mHighlightedCells) cell.mOutlineImage.enabled = true;
    }

    protected void ClearCells()
    {
        foreach (Cell cell in mHighlightedCells) cell.mOutlineImage.enabled = false;
    }

    #region Events
    public override void OnBeginDrag(PointerEventData eventData)
    {
        base.OnBeginDrag(eventData);

        CheckPathing();
        ShowCells();
    }

    public override void OnDrag(PointerEventData eventData)
    {
        base.OnDrag(eventData);

        // Follow Pointer
        transform.position += (Vector3)eventData.delta;
    }

    public override void OnEndDrag(PointerEventData eventData)
    {
        base.OnEndDrag(eventData);
        ClearCells();
    }
    #endregion
}
