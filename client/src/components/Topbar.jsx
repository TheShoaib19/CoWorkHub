import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Topbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          Admin Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
