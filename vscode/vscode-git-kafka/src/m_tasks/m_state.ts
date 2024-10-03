export class M_State {

    // add states enum with values InSearch, Cancelled, NewSearch
    enumStates = {
        InSearch: 0,
        Cancelled: 1,
        NewSearch: 2
    };

    // add state property
    mState: number = this.enumStates.InSearch;





}