import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UpgradeBanner = ({ user }) => {
  const { t } = useTranslation();
  if (!user || user.paid || user.freeTestsUsed < user.freeTestsLimit) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h3 className="font-bold text-lg">🎯 Bạn đã sử dụng hết {user.freeTestsUsed}/{user.freeTestsLimit} bài test miễn phí!</h3>
            <p className="text-sm opacity-90">
              Nâng cấp để tiếp tục luyện tập không giới hạn và truy cập tất cả tính năng AI
            </p>
          </div>
        </div>
        <Link
          to="/pricing"
          className="bg-white text-green-600 hover:bg-gray-100 font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
        >
{t('upgrade.upgradeNow')}
        </Link>
      </div>
    </div>
  );
};

export default UpgradeBanner;
