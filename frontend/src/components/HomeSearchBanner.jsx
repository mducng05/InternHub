import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import banner01 from "../assets/Banner/banner03.png";
import banner02 from "../assets/Banner/banner04.png";
import './HomeSearchBanner.css';

const banners = [banner01, banner02];
const availableLocations = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Nước ngoài"];

export default function HomeSearchBanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [locations, setLocations] = useState(searchParams.getAll("location") || []);
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerTransition, setBannerTransition] = useState(null);

  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "");
    setLocations(searchParams.getAll("location") || []);
  }, [searchParams]);

  useEffect(() => {
    const bannerTimer = window.setInterval(() => {
      if (bannerTransition) return;

      setBannerTransition({
        direction: "next",
        index: (activeBanner + 1) % banners.length,
      });
    }, 5000);

    return () => window.clearInterval(bannerTimer);
  }, [activeBanner, bannerTransition]);

  useEffect(() => {
    if (!bannerTransition) return undefined;

    const transitionTimer = window.setTimeout(() => {
      setActiveBanner(bannerTransition.index);
      setBannerTransition(null);
    }, 500);

    return () => window.clearTimeout(transitionTimer);
  }, [bannerTransition]);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (keyword.trim()) {
      nextParams.set("keyword", keyword.trim());
    } else {
      nextParams.delete("keyword");
    }
    nextParams.delete("location");
    locations.forEach((location) => nextParams.append("location", location));
    navigate(`/jobs?${nextParams.toString()}`);
  };

  const toggleLocation = (selectedLocation) => {
    setLocations((currentLocations) =>
      currentLocations.includes(selectedLocation)
        ? currentLocations.filter((location) => location !== selectedLocation)
        : [...currentLocations, selectedLocation]
    );
  };

  const showBanner = (direction) => {
    if (bannerTransition) return;

    setBannerTransition({
      direction,
      index: (activeBanner + (direction === "next" ? 1 : -1) + banners.length) % banners.length,
    });
  };

  return (
    <section className="py-5 shadow-sm text-dark" style={{ background: "#fff0f3" }}>
      <div className="container py-4">
        <form onSubmit={handleSearch} className="bg-white p-3 rounded-4 shadow-sm text-dark max-width-1000 mx-auto border">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-0 text-muted">
                  <i className="bi bi-search fs-5 text-pink" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none ps-0"
                  placeholder="Tên công việc, vị trí thực tập, kỹ năng..."
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4 border-start-md">
              <div className="location-filter input-group position-relative">
                <span className="input-group-text bg-white border-0 text-muted">
                  <i className="bi bi-geo-alt fs-5 text-pink" />
                </span>
                <details className="location-dropdown flex-grow-1">
                  <summary className="location-dropdown-toggle text-secondary">
                    <span className={locations.length ? "text-dark" : ""}>
                      {locations.length ? `${locations.length} thành phố đã chọn` : "Tất cả địa điểm"}
                    </span>
                    <i className="bi bi-chevron-down small" />
                  </summary>
                  <div className="location-dropdown-menu">
                    <p className="small text-muted mb-2">Chọn một hoặc nhiều thành phố</p>
                    {availableLocations.map((location) => (
                      <label key={location} className="location-option">
                        <input
                          type="checkbox"
                          value={location}
                          checked={locations.includes(location)}
                          onChange={() => toggleLocation(location)}
                        />
                        <span>{location}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            <div className="col-md-2">
              <button type="submit" className="btn btn-pink w-100 py-2 rounded-3 fw-bold" style={{ color: "#800f2f" }}>
                Tìm kiếm
              </button>
            </div>
          </div>
        </form>

        <div className="home-banner-slot mt-4">
          <button type="button" className="home-banner-arrow home-banner-arrow-prev" onClick={() => showBanner("previous")} disabled={Boolean(bannerTransition)} aria-label="Banner trước">
            <i className="bi bi-chevron-left" aria-hidden="true" />
          </button>
          <div className="home-banner-stage">
            <img src={banners[activeBanner]} alt={`Banner quảng cáo ${activeBanner + 1}`} className={`home-banner-slide${bannerTransition ? ` home-banner-slide-out-${bannerTransition.direction}` : ""}`} />
            {bannerTransition && (
              <img
                src={banners[bannerTransition.index]}
                alt={`Banner quảng cáo ${bannerTransition.index + 1}`}
                className={`home-banner-slide home-banner-slide-in-${bannerTransition.direction}`}
              />
            )}
          </div>
          <button type="button" className="home-banner-arrow home-banner-arrow-next" onClick={() => showBanner("next")} disabled={Boolean(bannerTransition)} aria-label="Banner tiếp theo">
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
