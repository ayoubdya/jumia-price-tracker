import React from 'react'

// import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'

// import useStyles from './../styles'

export default function Footer() {
  // const classes = useStyles()
  return (
    <Stack sx={{ mb: '1rem', display: 'felx', alignItems: 'center', justifyContent: 'center' }} direction="row" spacing={2}>
      <Avatar alt="Ayoub Diyae" src="https://i.imgur.com/IYXB8HL.jpg" />
      {/* <Typography variant="h6" align="center" gutterBottom>
        Footer
      </Typography> */}
      <Link href="https://www.facebook.com/AyoubDiyae" target="_blank" underline="none">
        <Typography variant="subtitle1" align="center" component="p">
          @AyoubDiyae
        </Typography>
      </Link>
      <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
        ayoubdya@gmail.com
      </Typography>

    </Stack >
  )
}
