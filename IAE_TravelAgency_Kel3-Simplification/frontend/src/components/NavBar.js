import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, 
  useMediaQuery, useTheme, Drawer, List, ListItem, ListItemText, Divider, Avatar
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrainIcon from '@mui/icons-material/Train';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

export default function NavBar() {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Penerbangan', path: '/search/flights', icon: <FlightIcon /> },
    { name: 'Hotel', path: '/search/hotels', icon: <HotelIcon /> },
    { name: 'Perjalanan Lokal', path: '/search/local-travel', icon: <DirectionsBusIcon /> },
    { name: 'Kereta Api', path: '/search/trains', icon: <TrainIcon /> },
    { name: 'Pemesanan', path: '/bookings', icon: <BookOnlineIcon /> },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Agen Perjalanan Indonesia
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.name} 
            component={RouterLink} 
            to={item.path}
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <Box sx={{ mr: 1 }}>{item.icon}</Box>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {isAuthenticated && currentUser ? (
          <>
            <ListItem 
              component={RouterLink} 
              to="/my-bookings"
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <Box sx={{ mr: 1 }}><BookOnlineIcon /></Box>
              <ListItemText primary="Pemesanan Saya" />
            </ListItem>
            <ListItem 
              component={RouterLink} 
              to="/profile"
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <Box sx={{ mr: 1 }}><PersonIcon /></Box>
              <ListItemText primary="Profil" />
            </ListItem>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <Box sx={{ mr: 1 }}><LogoutIcon /></Box>
              <ListItemText primary="Keluar" />
            </ListItem>
          </>
        ) : (
          <ListItem 
            component={RouterLink} 
            to="/login"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <Box sx={{ mr: 1 }}><LoginIcon /></Box>
            <ListItemText primary="Masuk" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            color: 'inherit', 
            textDecoration: 'none',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}
        >
          Agen Perjalanan Indonesia
        </Typography>
        
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button 
                key={item.name} 
                color="inherit" 
                component={RouterLink} 
                to={item.path}
                sx={{ 
                  mx: 0.5,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  borderRadius: '4px',
                  padding: '6px 12px'
                }}
                startIcon={item.icon}
              >
                {item.name}
              </Button>
            ))}
            
            {isAuthenticated && currentUser ? (
              <>
                <IconButton 
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff', color: '#1976d2' }}>
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem 
                    component={RouterLink} 
                    to="/my-bookings"
                    onClick={handleProfileMenuClose}
                    sx={{ minWidth: '150px' }}
                  >
                    <BookOnlineIcon sx={{ mr: 1 }} />
                    Pemesanan Saya
                  </MenuItem>
                  <MenuItem 
                    component={RouterLink} 
                    to="/profile"
                    onClick={handleProfileMenuClose}
                  >
                    <PersonIcon sx={{ mr: 1 }} />
                    Profil
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Keluar
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                variant="outlined"
                sx={{ 
                  ml: 1, 
                  borderColor: 'white',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } 
                }}
                startIcon={<LoginIcon />}
              >
                Masuk
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
