import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Privacy: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Privacy Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us, including name, email address, and any other information you choose to provide when using our Zero-Waste Swap Platform.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:
            • Provide and maintain our services
            • Process your transactions
            • Send you technical notices and support messages
            • Communicate with you about products, services, and events
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. Information Sharing
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell or share your personal information with third parties except as necessary to provide our services or as required by law.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to access, update, or delete your personal information. You can exercise these rights by contacting us through our platform.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            7. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us through our platform's contact form.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Privacy; 