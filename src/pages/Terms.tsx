import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Terms: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Terms of Service
          </Typography>
          
          <Typography variant="body1" paragraph>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using the Zero-Waste Swap Platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            You must create an account to use certain features of our platform. You are responsible for maintaining the confidentiality of your account information and for all activities under your account.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. Listing Guidelines
          </Typography>
          <Typography variant="body1" paragraph>
            When creating listings, you agree to:
            • Provide accurate and complete information
            • Only list items you have the right to swap or give away
            • Not list prohibited items
            • Maintain and update your listings
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. User Conduct
          </Typography>
          <Typography variant="body1" paragraph>
            You agree not to:
            • Violate any laws or regulations
            • Infringe on others' intellectual property rights
            • Harass or harm other users
            • Post false or misleading information
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. Platform Rules
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to:
            • Remove any content that violates these terms
            • Suspend or terminate accounts
            • Modify or discontinue services
            • Update these terms at any time
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. Liability
          </Typography>
          <Typography variant="body1" paragraph>
            The platform is provided "as is" without warranties of any kind. We are not responsible for the conduct of users or the quality of items exchanged through our platform.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            7. Contact
          </Typography>
          <Typography variant="body1" paragraph>
            For questions about these Terms of Service, please contact us through our platform's contact form.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Terms; 