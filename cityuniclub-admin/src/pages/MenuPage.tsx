import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem as MuiMenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { useAuth } from '../context/AuthContext'
import { FUNCTIONS_URL } from '../services/supabase'

type MenuType = 'breakfast' | 'lunch' | 'canapes'

interface MenuItemData {
  id: string
  menu: MenuType
  category: string | null
  section: string | null
  name: string
  description: string | null
  price: string | null
  formats: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
}

const LUNCH_CATEGORIES = ['Starters', 'Mains', 'Puddings']

const emptyForm = {
  menu: 'lunch' as MenuType,
  category: '',
  section: '',
  name: '',
  description: '',
  price: '',
  formats: '',
  sort_order: 0,
  is_active: true,
}

export default function MenuPage() {
  const { sessionToken } = useAuth()

  const [items, setItems] = useState<MenuItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<MenuType>('breakfast')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [uploading, setUploading] = useState<string | null>(null)

  const authHeaders = useMemo(() => ({
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json',
  }), [sessionToken])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-menu`, { headers: authHeaders })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load menu')
      setItems(data.items ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  useEffect(() => { fetchItems() }, [fetchItems])

  const filtered = useMemo(() =>
    items.filter(i => i.menu === tab).sort((a, b) => {
      const catA = a.category ?? a.section ?? ''
      const catB = b.category ?? b.section ?? ''
      if (catA !== catB) return catA.localeCompare(catB)
      return a.sort_order - b.sort_order
    }),
    [items, tab]
  )

  const groups = useMemo(() => {
    const map = new Map<string, MenuItemData[]>()
    for (const item of filtered) {
      const key = item.category ?? item.section ?? 'Items'
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return map
  }, [filtered])

  const handleOpenCreate = () => {
    setEditingItem(null)
    const nextSort = filtered.length > 0 ? Math.max(...filtered.map(i => i.sort_order)) + 1 : 1
    setForm({ ...emptyForm, menu: tab, sort_order: nextSort })
    setFormError('')
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: MenuItemData) => {
    setEditingItem(item)
    setForm({
      menu: item.menu,
      category: item.category ?? '',
      section: item.section ?? '',
      name: item.name,
      description: item.description ?? '',
      price: item.price ?? '',
      formats: item.formats ?? '',
      sort_order: item.sort_order,
      is_active: item.is_active,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return }
    setSubmitting(true)
    setFormError('')
    try {
      const body = {
        menu: form.menu,
        category: form.menu === 'lunch' ? form.category || null : null,
        section: null,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: form.price.trim() || null,
        formats: form.formats.trim() || null,
        sort_order: form.sort_order,
        is_active: form.is_active,
      }

      if (editingItem) {
        const res = await fetch(`${FUNCTIONS_URL}/admin-menu?id=${editingItem.id}`, {
          method: 'PUT', headers: authHeaders, body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setItems(prev => prev.map(i => i.id === editingItem.id ? data.item : i))
      } else {
        const res = await fetch(`${FUNCTIONS_URL}/admin-menu`, {
          method: 'POST', headers: authHeaders, body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setItems(prev => [...prev, data.item])
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-menu?id=${id}`, {
        method: 'DELETE', headers: authHeaders,
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const handleImageUpload = async (itemId: string, file: File) => {
    setUploading(itemId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('item_id', itemId)

      const res = await fetch(`${FUNCTIONS_URL}/admin-menu`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionToken}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, image_url: data.image_url } : i))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setUploading(null)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Menu</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Item
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Breakfast" value="breakfast" />
        <Tab label="Lunch" value="lunch" />
        <Tab label="Canapés" value="canapes" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No {tab} items yet. Click "Add Item" to create one.</Alert>
      ) : (
        [...groups.entries()].map(([group, groupItems]) => (
          <Box key={group} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>{group}</Typography>
            <Grid container spacing={2}>
              {groupItems.map(item => (
                <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                  <Card sx={{ opacity: item.is_active ? 1 : 0.5 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, mr: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.disabled', mr: 0.5, verticalAlign: 'text-bottom' }} />
                            {item.name}
                          </Typography>
                          {item.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {item.description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                            {item.price && <Chip label={item.price} size="small" color="success" variant="outlined" />}
                            {item.formats && <Chip label={item.formats} size="small" variant="outlined" />}
                            {!item.is_active && <Chip label="Hidden" size="small" color="default" />}
                            <Chip label={`#${item.sort_order}`} size="small" variant="outlined" />
                          </Box>
                        </Box>
                        {item.image_url && (
                          <Box
                            component="img"
                            src={item.image_url}
                            alt={item.name}
                            sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={() => handleOpenEdit(item)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton
                        size="small"
                        component="label"
                        disabled={uploading === item.id}
                      >
                        {uploading === item.id ? <CircularProgress size={18} /> : <PhotoCameraIcon fontSize="small" />}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={e => { if (e.target.files?.[0]) handleImageUpload(item.id, e.target.files[0]) }}
                        />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteConfirm(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <FormControl fullWidth>
              <InputLabel>Menu</InputLabel>
              <Select
                value={form.menu}
                label="Menu"
                onChange={e => setForm(f => ({ ...f, menu: e.target.value as MenuType, category: '', section: '' }))}
              >
                <MuiMenuItem value="breakfast">Breakfast</MuiMenuItem>
                <MuiMenuItem value="lunch">Lunch</MuiMenuItem>
                <MuiMenuItem value="canapes">Canapés</MuiMenuItem>
              </Select>
            </FormControl>

            {form.menu === 'lunch' && (
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={form.category} label="Category" onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {LUNCH_CATEGORIES.map(c => <MuiMenuItem key={c} value={c}>{c}</MuiMenuItem>)}
                </Select>
              </FormControl>
            )}

            <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} multiline rows={2} />
            <TextField label="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. £24.50" />
            <TextField label="Sort Order" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
            <FormControlLabel
              control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />}
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography>Are you sure? This will permanently remove this menu item.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
