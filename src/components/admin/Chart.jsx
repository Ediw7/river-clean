import PropTypes from 'prop-types';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrasi Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = ({ labels, data }) => {
  if (!labels || !data || labels.length === 0 || data.length === 0) {
    return <p className="text-center text-gray-500">Tidak ada data untuk ditampilkan.</p>;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Distribusi Tantangan',
        data,
        backgroundColor: [
          '#4A90E2',
          '#50C878',
          '#F7DC6F',
          '#E57373',
          '#AB47BC',
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

Chart.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default Chart;
