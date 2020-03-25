using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public Board mBoard;
    void Start()
    {
        mBoard.Create();   
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
