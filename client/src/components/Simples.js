import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import OutlinedInput from '@mui/material/OutlinedInput'
import MenuItem from '@mui/material/MenuItem'
import DialogActions from '@mui/material/DialogActions'

import useStyles from './../styles'

export default function Simples(props) {
  const classes = useStyles()

  const [open, setOpen] = useState(false);
  const [option, setOption] = useState("");
  const [finalOption, setFinalOption] = useState();
  const [sampleIsAvailable, setSampleIsAvailable] = useState(true)
  const [priceShowen, setPriceShowen] = useState(() => {
    if (props.pro.isSimpleSelected) {
      const simpleSelected = props.pro.simples.filter(simple => (simple.sku === props.pro.simpleSelected))[0]
      setSampleIsAvailable(simpleSelected.isBuyable)
      return simpleSelected.price
    } else {
      return props.pro.price
    }
  })

  useEffect(() => {
    if (finalOption) {
      const simpleSelected = props.pro.simples.filter(simple => (simple.sku === finalOption))[0]
      setPriceShowen(simpleSelected.price)
      props.setFinalOption(finalOption)
    }
    // eslint-disable-next-line
  }, [finalOption])

  const handleChange = (event) => {
    setOption(event.target.value)
  }

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleCancelClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false)
    }
  }

  const handleOkClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false)
      setFinalOption(option)
    }
  }

  return (
    <>
      <Button disabled={props.isEditMinPrice || !props.pro.isAvailable} className={sampleIsAvailable ? null : classes.sampleNotAvailable} onClick={handleClickOpen} sx={{ textTransform: 'none' }} >{`Price: ${priceShowen} Dh`}</Button>
      <Dialog disableEscapeKeyDown open={open} onClose={handleCancelClose}>
        <DialogTitle>Choose your option</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <FormControl sx={{ my: 1, minWidth: '12rem' }}>
              <InputLabel>Option</InputLabel>
              <Select value={option} onChange={handleChange} input={<OutlinedInput label='Option' />} >
                {props.pro.simples.map(simple => (
                  <MenuItem disabled={!simple.isBuyable} key={simple.sku} value={simple.sku}>
                    {`${simple.name} | ${simple.price} Dh`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose}>Cancel</Button>
          <Button onClick={handleOkClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}