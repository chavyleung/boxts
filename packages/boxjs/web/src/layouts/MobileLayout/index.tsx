import { FC } from 'react'

import Favorite from '@mui/icons-material/Favorite'
import Home from '@mui/icons-material/Home'
import LocationOn from '@mui/icons-material/LocationOn'
import Menu from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'

const Topbar = () => (
  <AppBar position="sticky" color="transparent" elevation={0}>
    <Toolbar>
      <Paper component="form" sx={{ display: 'flex', flex: 1 }}>
        <IconButton sx={{ p: 1 }} size="small">
          <Avatar
            src="https://raw.githubusercontent.com/Orz-3/mini/master/Color/surge.png"
            sx={{ width: 24, height: 24 }}
          />
        </IconButton>
        <InputBase placeholder="Search Google Maps" sx={{ mx: 1, flex: 1 }} />
        <IconButton sx={{ p: 1 }} size="small">
          <Menu />
        </IconButton>
      </Paper>
    </Toolbar>
  </AppBar>
)

const BottomBar = () => {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0
      }}
      elevation={3}
    >
      <BottomNavigation showLabels>
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Favorites" icon={<Favorite />} />
        <BottomNavigationAction label="Nearby" icon={<LocationOn />} />
      </BottomNavigation>
    </Paper>
  )
}

const MobileLayout: FC = ({ children }) => {
  return (
    <>
      <Topbar />
      <main>{children}</main>
      <BottomBar />
    </>
  )
}

export default MobileLayout
