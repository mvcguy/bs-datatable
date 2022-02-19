
//
// action types
//
class appActions {
   static readonly COL_SORTING = 'COL_SORTING';
   static readonly COL_RESIZED = 'COL_RESIZED';
   static readonly COL_SHOW_HIDE = 'COL_SHOW_HIDE';
   static readonly COL_REORDER = 'COL_REORDER'
}

//
// event types
//
class appDataEvents {

   static readonly GRID_DATA = "GRID_DATA";
   static readonly ON_NEXT_RECORD = "ON_NEXT_RECORD";
   static readonly ON_PREV_RECORD = "ON_PREV_RECORD";
   static readonly ON_SAVE_RECORD = "ON_SAVE_RECORD";
   static readonly ON_DELETE_RECORD = "ON_DELETE_RECORD";
   static readonly ON_LAST_RECORD = "ON_LAST_RECORD";
   static readonly ON_FIRST_RECORD = "ON_FIRST_RECORD";
   static readonly ON_ADD_RECORD = "ON_ADD_RECORD";
   static readonly ON_FETCH_RECORD = "ON_FETCH_RECORD";
   static readonly ON_FETCH_RECORD_ERROR = "ON_FETCH_RECORD_ERROR";
   static readonly ON_FETCH_GRID_RECORD = "ON_FETCH_GRID_RECORD";
   static readonly ON_FETCH_GRID_RECORD_ERROR = "ON_FETCH_GRID_RECORD_ERROR";
   static readonly ON_NAVIGATING_RECORD = "ON_NAVIGATING_RECORD"; // raised when the main record is about to navigate
   static readonly ON_GRID_UPDATED = "ON_GRID_UPDATED";
   static readonly ON_SAVE_ERROR = "ON_SAVE_ERROR";
   static readonly ON_SORTING_REQUESTED = "ON_SORTING_REQUESTED";
   static readonly ON_COLS_REORDERED = "ON_COLS_REORDERED";
   static readonly ON_GRID_DATA_BOUND = "ON_GRID_DATA_BOUND";
   static readonly ON_GRID_CONFIG_UPDATED = "ON_GRID_CONFIG_UPDATED";
   static readonly ON_PAGE_READY = "ON_PAGE_READY";
   static readonly ON_ROW_UPDATED = "ON_ROW_UPDATED";
   static readonly ON_FIELD_UPDATED = "ON_FIELD_UPDATED";
   static readonly ON_ROW_DOUBLE_CLICKED = "ON_ROW_DOUBLE_CLICKED"
}

export { appActions, appDataEvents }
