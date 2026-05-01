using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public Board mBoard;

    public PieceManager mPieceManager;
    void Start()
    {
        // Create the board
        mBoard.Create();

        // Create Pieces
        mPieceManager.Setup(mBoard);
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
