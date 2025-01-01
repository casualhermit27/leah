function ModelStatusBadge({ isAvailable }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: '6px',
        backgroundColor: isAvailable ? '#DEF7EC' : '#FDE8E8',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: isAvailable ? '#059669' : '#E02424',
        }}
      />
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: isAvailable ? '#059669' : '#E02424',
        }}
      >
        {isAvailable ? 'Active' : 'Unavailable'}
      </Typography>
    </Box>
  );
} 