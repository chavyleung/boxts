import { ReactElement } from 'react'

import MobileLayout from '@/layouts/MobileLayout'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

const BoxJs = () => (
  <Paper elevation={0} sx={{ mx: 3 }}>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel1a-header">
        <Typography>Accordion 1</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel2a-header">
        <Typography>Accordion 2</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel3a-header">
        <Typography>Disabled Accordion</Typography>
      </AccordionSummary>
    </Accordion>
  </Paper>
)

export default BoxJs

BoxJs.getLayout = (page: ReactElement) => {
  return <MobileLayout>{page}</MobileLayout>
}
