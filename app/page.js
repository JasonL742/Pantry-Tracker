'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
    text: {
      primary: '#ffffff',
    },
  },
})

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

// Global CSS to remove default margins and paddings
const GlobalStyles = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
`

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [updateItemName, setUpdateItemName] = useState('')
  const [updateQuantity, setUpdateQuantity] = useState('')
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
      setFilteredInventory(inventoryList)
    } catch (error) {
      console.error("Error updating inventory:", error)
    }
  }
  
  useEffect(() => {
    updateInventory()
  }, [])
 
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredInventory(inventory)
    } else {
      const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredInventory(filtered)
    }
  }, [searchQuery, inventory])

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + 1 })
      } else {
        await setDoc(docRef, { quantity: 1 })
      }
      await updateInventory()
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }
  
  const updateItem = async (item, quantity) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        await setDoc(docRef, { quantity: parseInt(quantity) })
        if(quantity == 0) {
          await deleteDoc(docRef)
        }  
      }
      
      else {
        console.error("Item does not exist.")
      }
      await updateInventory()
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data() 
          await deleteDoc(docRef)
        
      }
      await updateInventory()
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleUpdateModalOpen = (name, quantity) => {
    setUpdateItemName(name)
    setUpdateQuantity(quantity)
    setUpdateModalOpen(true)
  }
  const handleUpdateModalClose = () => setUpdateModalOpen(false)

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <style jsx global>{GlobalStyles}</style>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Modal
          open={updateModalOpen}
          onClose={handleUpdateModalClose}
          aria-labelledby="modal-update-title"
          aria-describedby="modal-update-description"
        >
          <Box sx={style}>
            <Typography id="modal-update-title" variant="h6" component="h2">
              Update Item Quantity
            </Typography>
            <Stack width="100%" direction={'column'} spacing={2}>
              <TextField
                id="update-item-name"
                label="Item"
                variant="outlined"
                fullWidth
                value={updateItemName}
                onChange={(e) => setUpdateItemName(e.target.value)}
                disabled
              />
              <TextField
                id="update-quantity"
                label="Quantity"
                variant="outlined"
                fullWidth
                value={updateQuantity}
                onChange={(e) => setUpdateQuantity(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  updateItem(updateItemName, updateQuantity)
                  setUpdateItemName('')
                  setUpdateQuantity('')
                  handleUpdateModalClose()
                }}
              >
                Update
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <TextField
            id="search-bar"
            label="Search Items"
            variant="outlined"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>
        </Stack>
        <Box border={'1px solid #333'}>
          <Box
            width="800px"
            height="100px"
            bgcolor={'#333'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant={'h2'} color={'#fff'} textAlign={'center'}>
              Inventory Items
            </Typography>
          </Box>
          <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
            {filteredInventory.map(({ name, quantity }) => (
              <Box
                key={name}
                minHeight="150px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#1d1d1d'}
                paddingX={5}
              >
                <Typography variant={'h3'} color={'#fff'} textAlign={'center'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'h3'} color={'#fff'} textAlign={'center'}>
                  Quantity: {quantity}
                </Typography>
                <Stack direction={'row'} spacing={2}>
                  <Button variant="contained" onClick={() => handleUpdateModalOpen(name, quantity)}>
                    Update
                  </Button>
                  <Button variant="contained" onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
