# Backend:
    - Once a ONCE_PER_ROUND card is used its status is changed to `isUsed = true` but after round ends
    it stays this way, therefore preventing it from ever being used. (Feautre not implemented)
    - Currently a dungeon effect can be used even when there is a spell at play. (Needs to add
    a verification for whether spell is at play and whether card can ignore this and still be used
    even though a spell is at play)
    - Update mechanics for better inheritancing
