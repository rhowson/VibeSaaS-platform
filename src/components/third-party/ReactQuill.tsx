'use client';

// next
import dynamic from 'next/dynamic';

// material-ui
import Box from '@mui/material/Box';

// third-party
import 'react-quill-new/dist/quill.snow.css';

// project imports
import { ThemeDirection } from 'config';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Props {
  value?: string;
  editorMinHeight?: number;
  onChange?: (value: string) => void;
}

// ==============================|| QUILL EDITOR ||============================== //

export default function ReactQuillDemo({ value, editorMinHeight = 135, onChange }: Props) {
  return (
    <Box
      sx={(theme) => ({
        '& .quill': {
          bgcolor: 'background.paper',
          ...theme.applyStyles('dark', { bgcolor: 'secondary.main' }),
          borderRadius: '4px',
          '& .ql-toolbar': {
            bgcolor: 'secondary.100',
            ...theme.applyStyles('dark', { bgcolor: 'secondary.light' }),
            borderColor: 'divider',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          },
          '& .ql-snow .ql-picker': {
            ...theme.applyStyles('dark', { color: 'secondary.500' })
          },
          '& .ql-snow .ql-stroke': {
            ...theme.applyStyles('dark', { stroke: theme.palette.secondary[500] })
          },
          '& .ql-container': {
            bgcolor: 'transparent',
            ...theme.applyStyles('dark', { bgcolor: 'background.default' }),
            borderColor: `${theme.palette.secondary.light} !important`,
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            '& .ql-editor': { minHeight: editorMinHeight }
          },
          ...(theme.direction === ThemeDirection.RTL && {
            '& .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg': {
              right: '0%',
              left: 'inherit'
            }
          })
        }
      })}
    >
      <ReactQuill {...(value && { value })} {...(onChange && { onChange })} />
    </Box>
  );
}
