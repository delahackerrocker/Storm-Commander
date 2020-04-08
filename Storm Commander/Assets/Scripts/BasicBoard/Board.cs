using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Board : MonoBehaviour
{
    // TODO: use a variable amount of cell numbers
    public const int SCALE = 8;

    public GameObject mCellPrefab;

    [HideInInspector]
    public Cell[,] mAllCells = new Cell[SCALE, SCALE];

    public void Create()
    {
        // Create
        for (int y = 0; y < SCALE; y++)
        {
            for (int x = 0; x < SCALE; x++)
            {
                // Create the cell
                GameObject newCell = Instantiate(mCellPrefab, transform);

                // position
                RectTransform rectTransform = newCell.GetComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2((x * Cell.SCALE) + (Cell.SCALE/2), (y * Cell.SCALE) + (Cell.SCALE / 2));

                // setup
                mAllCells[x, y] = newCell.GetComponent<Cell>();
                mAllCells[x, y].Setup(new Vector2Int(x, y), this);
            }
        }

        // Color
        for (int x = 0; x < 8; x += 2)
        {
            for (int y = 0; y < 8; y++)
            {
                // Offset for every other line
                int offset = (y % 2 != 0) ? 0 : 1;
                int finalX = x + offset;

                // Color
                mAllCells[finalX, y].GetComponent<Image>().color = new Color32(230, 220, 187, 255);
            }
        }
    }

    void Start()
    {
        
    }

    void Update()
    {
        
    }
}
