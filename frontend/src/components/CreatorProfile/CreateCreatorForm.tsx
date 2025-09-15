import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Chip,
  Box,
  Typography,
  Autocomplete,
} from '@mui/material';
import { useAppDispatch } from '../../hooks/redux';
import { createCreator } from '../../store/slices/creatorSlice';

interface CreateCreatorFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const contentTypes = [
  'Lifestyle',
  'Fashion',
  'Beauty',
  'Tech',
  'Gaming',
  'Food',
  'Travel',
  'Fitness',
  'Music',
  'Comedy',
  'Education',
  'Business',
];

const commonTags = [
  'Micro Influencer',
  'Macro Influencer',
  'Celebrity',
  'Brand Ambassador',
  'Content Creator',
  'Lifestyle',
  'Fashion',
  'Beauty',
  'Tech',
  'Gaming',
];

export default function CreateCreatorForm({ onClose, onSuccess }: CreateCreatorFormProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    twitter: '',
    facebook: '',
    facebook_followers: '',
    primary_content_type: '',
    audience_size: '',
    engagement_rate: '',
    source_of_contact: '',
    notes: '',
    verified: false,
    demographics: {
      young_adult_percentage: '',
      us_followers_percentage: '',
    },
  });
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Handle demographics fields specially
    if (name.startsWith('demographics.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        demographics: {
          ...prev.demographics,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        audience_size: formData.audience_size ? parseInt(formData.audience_size) : 0,
        engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : 0,
        facebook_followers: formData.facebook_followers ? parseInt(formData.facebook_followers) : 0,
        demographics: {
          young_adult_percentage: formData.demographics.young_adult_percentage ? parseInt(formData.demographics.young_adult_percentage) : 0,
          us_followers_percentage: formData.demographics.us_followers_percentage ? parseInt(formData.demographics.us_followers_percentage) : 0,
          age_brackets: {},
          countries: {},
        },
        tags,
        social_handles: {
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          twitter: formData.twitter,
          facebook: formData.facebook,
        },
      };

      await dispatch(createCreator(submitData)).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Failed to create creator:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Add New Creator</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              name="full_name"
              label="Full Name *"
              fullWidth
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="phone"
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={contentTypes}
              value={formData.primary_content_type}
              onChange={(_, value) => setFormData(prev => ({ ...prev, primary_content_type: value || '' }))}
              renderInput={(params) => (
                <TextField {...params} label="Primary Content Type" />
              )}
              freeSolo
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Social Media Handles
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="instagram"
              label="Instagram"
              fullWidth
              value={formData.instagram}
              onChange={handleChange}
              InputProps={{ startAdornment: '@' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="tiktok"
              label="TikTok"
              fullWidth
              value={formData.tiktok}
              onChange={handleChange}
              InputProps={{ startAdornment: '@' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="youtube"
              label="YouTube"
              fullWidth
              value={formData.youtube}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="twitter"
              label="Twitter"
              fullWidth
              value={formData.twitter}
              onChange={handleChange}
              InputProps={{ startAdornment: '@' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="facebook"
              label="Facebook"
              fullWidth
              value={formData.facebook}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="facebook_followers"
              label="Facebook Followers"
              type="number"
              fullWidth
              value={formData.facebook_followers}
              onChange={handleChange}
              helperText="Required for META filter"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Demographics (for META Filter)
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="demographics.young_adult_percentage"
              label="Young Adult Audience (%)"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              fullWidth
              value={formData.demographics.young_adult_percentage}
              onChange={handleChange}
              helperText="% of audience aged 18-34"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="demographics.us_followers_percentage"
              label="US Followers (%)"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              fullWidth
              value={formData.demographics.us_followers_percentage}
              onChange={handleChange}
              helperText="% of audience in United States"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="audience_size"
              label="Audience Size"
              type="number"
              fullWidth
              value={formData.audience_size}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="engagement_rate"
              label="Engagement Rate (%)"
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 100 }}
              fullWidth
              value={formData.engagement_rate}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="source_of_contact"
              label="Source of Contact"
              fullWidth
              value={formData.source_of_contact}
              onChange={handleChange}
              placeholder="e.g., Instagram DM, Email, Referral"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={commonTags}
              value={tags}
              onChange={(_, newValue) => setTags(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Add tags" />
              )}
              freeSolo
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="verified"
                  checked={formData.verified}
                  onChange={handleChange}
                />
              }
              label="Verified Creator"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || !formData.full_name}
        >
          {isSubmitting ? 'Creating...' : 'Create Creator'}
        </Button>
      </DialogActions>
    </form>
  );
}