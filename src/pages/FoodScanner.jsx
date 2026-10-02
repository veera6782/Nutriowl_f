import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiImage } from 'react-icons/fi';
import CameraPreview from '../components/CameraPreview';
import UploadButton from '../components/UploadButton';
import ScanButton from '../components/ScanButton';
import TipsCard from '../components/TipsCard';
import RecentScanCard from '../components/RecentScanCard';
import BottomNavigation from '../components/BottomNavigation';
import { analyzeFood } from '../services/foodService';

export default function FoodScanner() {
  const [tab, setTab] = useState('camera');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [scans, setScans] = useState([]);

  // subscribe to real scan history
  React.useEffect(() => {
    let mounted = true;
    async function loadScans() {
      try {
        const ss = await import('../services/scanService');
        const s = ss.default.load();
        if (!mounted) return;
        setScans(s);
        const unsub = ss.default.subscribe(list => setScans(list || []));
        return unsub;
      } catch (e) {
        console.warn('No scan service available', e);
      }
    }
    const maybeUnsub = loadScans();
    return () => {
      mounted = false;
      if (maybeUnsub && typeof maybeUnsub.then === 'function') {
        maybeUnsub.then(u => u && u());
      }
    };
  }, []);

  async function handleCapture(imageBlob) {
    setLoading(true);
    setResult(null);
    setScanError('');
    try {
      const res = await analyzeFood(imageBlob);
      setResult(res);

      // save scan to storage
      try {
        const scanService = await import('../services/scanService');
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const scanObj = {
          id,
          name: res.food || 'Unknown',
          calories: res.calories || 0,
          protein: res.protein || 0,
          carbs: res.carbs || res.carbohydrates || 0,
          fats: res.fat || res.fats || 0,
          image: uploadedImage || '/placeholder1.jpg',
          timestamp: new Date().toISOString(),
        };
        scanService.default.addScan(scanObj);
      } catch (e) {
        console.warn('Could not persist scan result', e);
      }

      // notify goals service that a scan occurred (increment scan goal)
      try {
        const goalsService = await import('../services/goalsService');
        if (goalsService && goalsService.default) goalsService.default.incrementProgress('scan', 1);
      } catch (e) {
        console.warn('Could not notify goals service', e);
      }
    } catch (e) {
      console.error(e);
      setScanError('We could not analyze this image. Please try another photo.');
    } finally {
      // keep loading a little to show animation
      setTimeout(() => setLoading(false), 800);
    }
  }

  return (
    <div className="min-h-screen bg-cream font-poppins text-darkgreen p-4 pb-32">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-start justify-between">
          <button aria-label="Back" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">{
            '<'
          }</button>
          <div className="flex-1 mx-4">
            <h1 className="text-3xl font-bold">Scan Food</h1>
            <p className="text-sm text-gray-600 mt-1">Scan your meal and discover its nutrition!</p>
          </div>
          <div className="w-24 h-24 overflow-hidden rounded-full bg-[#edf8ed] p-1 shadow-[0_8px_16px_rgba(46,94,62,0.08)]">
            <img src="/nutriowl_mascot_full.jpg" alt="NutriOwl mascot" className="h-full w-full object-cover rounded-full" />
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-2">
          <div className="flex items-center gap-4">
            <button onClick={() => setTab('camera')} className={`flex-1 py-3 rounded-lg ${tab === 'camera' ? 'bg-green-100 text-darkgreen' : 'text-gray-600'}`}>
              <span className="inline-flex items-center gap-2 justify-center"><span className="bg-green-500 text-white p-1 rounded-full"><FiCamera size={16} aria-hidden="true" /></span> Camera</span>
            </button>
            <button onClick={() => setTab('upload')} className={`flex-1 py-3 rounded-lg ${tab === 'upload' ? 'bg-green-100 text-darkgreen' : 'text-gray-600'}`}>
              <span className="inline-flex items-center gap-2 justify-center"><span className="bg-transparent text-darkgreen p-1 rounded-full"><FiImage size={18} aria-hidden="true" /></span> Upload Photo</span>
            </button>
          </div>

          <div className="mt-4">
            <AnimatePresence mode="wait">
              {tab === 'camera' ? (
                <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <CameraPreview onCapture={handleCapture} uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} />
                </motion.div>
              ) : (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <UploadButton onCapture={handleCapture} uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {scanError && (
          <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {scanError}
          </div>
        )}

        {result && (
          <section aria-labelledby="scan-results-title" className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="scan-results-title" className="text-xl font-bold text-darkgreen">{result.food || 'Nutrition details'}</h2>
                <p className="mt-1 text-sm text-gray-600">Nutrition per scanned serving</p>
              </div>
              {result.healthScore != null && (
                <div className="shrink-0 rounded-xl bg-green-50 px-3 py-2 text-center">
                  <div className="text-lg font-bold text-green-800">{result.healthScore}</div>
                  <div className="text-xs text-gray-600">Health score</div>
                </div>
              )}
            </div>

            {result.isSample && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                Demo estimate only. Image recognition is not connected, so these values may not match your food.
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ['Calories', result.calories, 'kcal'],
                ['Protein', result.protein, 'g'],
                ['Carbohydrates', result.carbs ?? result.carbohydrates, 'g'],
                ['Fat', result.fat ?? result.fats, 'g'],
                ['Sugar', result.sugar, 'g'],
                ['Fiber', result.fiber, 'g'],
                ['Sodium', result.sodium, 'mg']
              ].map(([label, value, unit]) => (
                <div key={label} className="rounded-xl bg-[#f6f8f2] px-3 py-3">
                  <div className="text-xs text-gray-600">{label}</div>
                  <div className="mt-1 font-semibold text-darkgreen">
                    {value == null || value === '' ? 'Not available' : `${value} ${unit}`}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['Vitamins', result.vitamins],
                ['Minerals', result.minerals]
              ].map(([title, items]) => (
                <div key={title}>
                  <h3 className="font-semibold text-darkgreen">{title}</h3>
                  {Array.isArray(items) && items.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {items.map((item, index) => {
                        const label = typeof item === 'string'
                          ? item
                          : `${item.name || item.label || title.slice(0, -1)}${item.amount != null || item.value != null ? `: ${item.amount ?? item.value} ${item.unit || ''}` : ''}`;
                        return <li key={`${label}-${index}`} className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-900">{label}</li>;
                      })}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">Not available</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6">
          <TipsCard />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-lg">Recent Scans</h3>
            <button className="text-green-600 font-medium">View All ›</button>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto py-2">
            {scans && scans.length ? (
              scans.slice(0,5).map(item => (
                <RecentScanCard key={item.id} item={{ id: item.id, food: item.name || item.food || 'Unknown', calories: item.calories || 0, time: new Date(item.timestamp).toLocaleString(), image: item.image || '/placeholder1.jpg' }} />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-4 shadow-sm text-gray-600">No recent scans yet. Try scanning your first meal!</div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>{loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 w-80 flex flex-col items-center gap-4">
            <div className="w-32 h-32 overflow-hidden rounded-full bg-[#edf8ed] p-2 shadow-[0_8px_16px_rgba(46,94,62,0.08)]">
              <img src="/nutriowl_mascot_full.jpg" alt="NutriOwl mascot" className="h-full w-full object-cover rounded-full" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Analyzing your meal...</p>
              <p className="text-sm text-gray-600 mt-1">This may take a moment</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div className="h-3 bg-green-400" initial={{ width: '0%' }} animate={{ width: '80%' }} transition={{ repeat: Infinity, duration: 1.6 }} />
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      <BottomNavigation active="scan" />
    </div>
  );
}
