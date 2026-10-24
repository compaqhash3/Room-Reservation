import { useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Button, Collapse, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
} from '@mui/material';
import {
  Assessment, Brightness4, Brightness7, EventNote, ExpandLess, ExpandMore, Logout, MeetingRoom, Menu, People, TableChart,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { imageUrl } from '../utils/format';

const WIDE = 240;
const NARROW = 64;

export default function Layout() {
  const { user, logout } = useAuth();
  const { mode, toggle } = useThemeMode();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);

  if (!user) return <Navigate to="/login" replace />;

  const width = expanded ? WIDE : NARROW;

  const menuItem = (path: string, icon: ReactNode, text: string, indent = 2) => (
    <ListItemButton selected={pathname.startsWith(path)} onClick={() => navigate(path)} sx={{ pl: indent }}>
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      {expanded && <ListItemText primary={text} />}
    </ListItemButton>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => setExpanded(!expanded)}><Menu /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Room Reservation System</Typography>
          <IconButton color="inherit" onClick={toggle} title="Toggle dark mode">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Avatar src={imageUrl(user.imageUrl)} sx={{ mx: 1 }}>{user.firstName[0]}</Avatar>
          <Typography sx={{ mr: 2 }}>Hello, {user.firstName} {user.lastName}</Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width, flexShrink: 0, transition: 'width .2s', '& .MuiDrawer-paper': { width, overflowX: 'hidden', transition: 'width .2s' } }}>
        <Toolbar />
        <List>
          {menuItem('/rooms', <MeetingRoom />, 'Rooms')}
          {menuItem('/users', <People />, 'Users')}
          {menuItem('/reservations', <EventNote />, 'Reservations')}
          <ListItemButton onClick={() => setReportsOpen(!reportsOpen)}>
            <ListItemIcon sx={{ minWidth: 40 }}><Assessment /></ListItemIcon>
            {expanded && <><ListItemText primary="Reports" />{reportsOpen ? <ExpandLess /> : <ExpandMore />}</>}
          </ListItemButton>
          <Collapse in={reportsOpen}>
            {menuItem('/reports/room-usage', <TableChart />, 'Room usage', expanded ? 4 : 2)}
          </Collapse>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
