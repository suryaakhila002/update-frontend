import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close'; // <-- CHANGED LINE
import {useSelector, useDispatch} from 'react-redux';
import MuiAlert from '@mui/material/Alert';

export default function SimpleSnackbar() {
  const dispatch = useDispatch();
  const snack = useSelector(state=>state.Layout.snack);
  const snackMessage = useSelector(state=>state.Layout.snack_message);
  const snackType = useSelector(state=>state.Layout.snack_type);
//   const [open, setOpen] = React.useState(snack);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch({type: 'close_snack'});
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snack}
        autoHideDuration={6000}
        onClose={handleClose}
        severity={snackType}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }>
            <Alert onClose={handleClose} severity={snackType}>
                {snackMessage}
            </Alert>
        </Snackbar>
    </div>
  );
}