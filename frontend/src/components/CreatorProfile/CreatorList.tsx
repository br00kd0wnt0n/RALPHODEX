import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Pagination,
  Dialog,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  FilterAlt as FilterAltIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchCreators, deleteCreator } from '../../store/slices/creatorSlice';
import CreateCreatorForm from './CreateCreatorForm';

export default function CreatorList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { creators, isLoading, totalPages, currentPage, total } = useAppSelector((state) => state.creators);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [metaFilter, setMetaFilter] = useState(false);

  useEffect(() => {
    dispatch(fetchCreators({ 
      page, 
      search: search || undefined,
      metaFilter: metaFilter || undefined 
    }));
  }, [dispatch, page, search, metaFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      dispatch(deleteCreator(id));
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Creators ({total})
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={metaFilter ? "contained" : "outlined"}
            startIcon={<FilterAltIcon />}
            onClick={() => {
              setMetaFilter(!metaFilter);
              setPage(1);
            }}
            color={metaFilter ? "secondary" : "primary"}
            sx={{
              backgroundColor: metaFilter ? '#31BDBF' : 'transparent',
              '&:hover': {
                backgroundColor: metaFilter ? '#28A5A7' : 'rgba(49, 189, 191, 0.1)'
              }
            }}
          >
            Filter Meta Creators
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Add Creator
          </Button>
        </Box>
      </Box>

      {metaFilter && (
        <Box mb={2}>
          <Chip
            label="Filter Active: Facebook >1K followers, Young Adult >20%, US followers >20%"
            color="secondary"
            onDelete={() => {
              setMetaFilter(false);
              setPage(1);
            }}
            sx={{ 
              backgroundColor: '#31BDBF',
              color: 'white',
              '& .MuiChip-deleteIcon': {
                color: 'white'
              }
            }}
          />
        </Box>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search creators by name, email, or content type..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Content Type</TableCell>
              <TableCell align="right">Audience</TableCell>
              <TableCell align="right">Engagement</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {creators.map((creator) => (
              <TableRow key={creator.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">
                      {creator.full_name}
                    </Typography>
                    {creator.email && (
                      <Typography variant="caption" color="textSecondary">
                        {creator.email}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{creator.primary_content_type || 'N/A'}</TableCell>
                <TableCell align="right">
                  {formatNumber(creator.audience_size)}
                </TableCell>
                <TableCell align="right">
                  {creator.engagement_rate}%
                </TableCell>
                <TableCell>
                  <Chip
                    label={creator.verified ? 'Verified' : 'Unverified'}
                    color={creator.verified ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {creator.tags.slice(0, 2).map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                    {creator.tags.length > 2 && (
                      <Chip label={`+${creator.tags.length - 2}`} size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/creators/${creator.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => {}}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(creator.id, creator.full_name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <CreateCreatorForm
          onClose={() => setOpenCreateDialog(false)}
          onSuccess={() => {
            setOpenCreateDialog(false);
            dispatch(fetchCreators({ page: 1, search: search || undefined }));
          }}
        />
      </Dialog>
    </Box>
  );
}