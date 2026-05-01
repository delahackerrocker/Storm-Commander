using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PieceManager : MonoBehaviour
{
    public GameObject mPiecePrefab;

    public Color pirateColor = Color.white;
    public Color roboColor = Color.black;

    public Color32 pirateSpriteColor = new Color32(80, 124, 159, 255);
    public Color32 roboSpriteColor = new Color32(210, 95, 64, 255);

    private List<BasePiece> mPiratePieces = null;
    private List<BasePiece> mRoboPieces = null;

    private string[] mPieceOrder = new string[16] {
        "P", "P", "P", "P", "P", "P", "P", "P",
        "R", "KN", "B", "K", "Q", "B", "KN", "R"
    };

    private Dictionary<string, Type> mPieceLibrary = new Dictionary<string, Type>()
    {
        {"P", typeof(Pawn) },
        {"R", typeof(Rook) },
        {"KN", typeof(Knight) },
        {"B", typeof(Bishop) },
        {"K", typeof(King) },
        {"Q", typeof(Queen) }
    };

    public void Setup(Board board)
    {
        // Create Pirate Pieces
        mPiratePieces = CreatePieces(pirateColor, pirateSpriteColor, board);

        // Create Robo Pieces
        mRoboPieces = CreatePieces(roboColor, roboSpriteColor, board);

        // Place Pieces
        PlacePieces(1, 0, mPiratePieces, board);
        PlacePieces(6, 7, mRoboPieces, board);

        // Pirates go first
        // Switch sides()
    }

    private List<BasePiece> CreatePieces(Color teamColor, Color32 spriteColor, Board board)
    {
        List<BasePiece> newPieces = new List<BasePiece>();

        for (int i = 0; i < mPieceOrder.Length; i++)
        {
            // Create new piece
            GameObject newPieceObject = Instantiate(mPiecePrefab);
            newPieceObject.transform.SetParent(transform);

            // set scale and position of the new piece
            newPieceObject.transform.localScale = new Vector3(1, 1, 1);
            newPieceObject.transform.localRotation = Quaternion.identity;

            // Get the type for this piece and apply it
            string key = mPieceOrder[i];
            Type pieceType = mPieceLibrary[key];

            // get the class name for this piece, all pieces extend BasePiece
            BasePiece newPiece = (BasePiece)newPieceObject.AddComponent(pieceType);
            // Store new piece
            newPieces.Add(newPiece);
            newPiece.Setup(teamColor, spriteColor, this);
        }

        return newPieces;
    }

    private void PlacePieces(int pawnRow, int royaltyRow, List<BasePiece> pieces, Board board)
    {
        for (int i = 0; i < Board.SCALE; i++)
        {
            // Place Pawns
            pieces[i].Place(board.mAllCells[i, pawnRow]);

            // Place Royalty
            pieces[i+8].Place(board.mAllCells[i, royaltyRow]);
        }
    }

}