'use client';

import React, { useState, useEffect } from 'react';
import { Search, FileText, Loader2, Plus, Minus, X, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  product_no: number;
  product_name: string;
  price: string;
  display: string;
  selling: string;
  detail_image: string;
  product_code: string;
  created_date: string;
}

interface Category {
  category_no: number;
  category_name: string;
  category_depth: number;
  parent_category_no: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // 견적 장바구니 상태
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<QuoteFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories) {
          const depth1 = data.categories.filter((c: Category) => c.category_depth === 1);
          setCategories(depth1);
        }
      } catch (err) {
        console.error('Categories fetch error:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search, selectedCategory);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const fetchProducts = async (keyword = '', categoryNo: number | null = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (categoryNo) params.set('category', categoryNo.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        const initialQuantities: Record<number, number> = {};
        data.products.forEach((p: Product) => {
          initialQuantities[p.product_no] = 1;
        });
        setQuantities(initialQuantities);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  // 장바구니에 추가
  const addToCart = (product: Product) => {
    const qty = quantities[product.product_no] || 1;

    setCart(prev => {
      const existing = prev.find(item => item.product.product_no === product.product_no);
      if (existing) {
        return prev.map(item =>
          item.product.product_no === product.product_no
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });

    // 수량 초기화
    setQuantities(prev => ({ ...prev, [product.product_no]: 1 }));
  };

  // 장바구니에서 제거
  const removeFromCart = (productNo: number) => {
    setCart(prev => prev.filter(item => item.product.product_no !== productNo));
  };

  // 장바구니 수량 변경
  const updateCartQuantity = (productNo: number, delta: number) => {
    setCart(prev =>
      prev.map(item =>
        item.product.product_no === productNo
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // 총 금액 계산
  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  // 견적 요청 제출
  const handleSubmitQuote = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const quoteData = {
      customer: formData,
      items: cart.map(item => ({
        product_no: item.product.product_no,
        product_name: item.product.product_name.replace(/<[^>]*>/g, ''),
        product_code: item.product.product_code,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: Number(item.product.price) * item.quantity
      })),
      totalAmount,
      requestDate: new Date().toISOString()
    };

    console.log('견적 요청 데이터:', quoteData);

    // 실제 구현 시 서버로 전송
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert(`견적 요청이 접수되었습니다!\n\n담당자가 ${formData.email}로 견적서를 보내드립니다.\n\n선택 품목: ${cart.length}개\n총 금액: ${totalAmount.toLocaleString('ko-KR')}원`);

    // 초기화
    setCart([]);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8 animate-in bg-white min-h-screen">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            제품 카탈로그
          </h1>
          <p className="text-gray-600 mt-1">제품을 선택하고 견적을 요청하세요</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="상품명으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-gray-900 placeholder:text-gray-400"
          />
        </form>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === null
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category_no}
            onClick={() => setSelectedCategory(cat.category_no)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat.category_no
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {cat.category_name}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 font-semibold text-sm text-gray-700">상품정보</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700">상품코드</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700">가격</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700">수량 선택</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 text-right">견적 담기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    <p className="mt-2 text-gray-500">상품 데이터를 불러오는 중...</p>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => {
                  const isInCart = cart.some(item => item.product.product_no === product.product_no);
                  return (
                    <tr key={product.product_no} className={cn(
                      "hover:bg-blue-50/50 transition-colors group",
                      isInCart && "bg-green-50"
                    )}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                            {product.detail_image ? (
                              <img src={product.detail_image} alt={product.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">이미지</div>
                            )}
                          </div>
                          <span className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                            <span dangerouslySetInnerHTML={{ __html: product.product_name }} />
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{product.product_code}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                        {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Number(product.price))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 bg-gray-100 w-fit rounded-lg p-1 border border-gray-200">
                          <button
                            onClick={() => updateQuantity(product.product_no, -1)}
                            className="p-1.5 hover:bg-white rounded transition-colors text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{quantities[product.product_no] || 1}</span>
                          <button
                            onClick={() => updateQuantity(product.product_no, 1)}
                            className="p-1.5 hover:bg-white rounded transition-colors text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => addToCart(product)}
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95",
                            isInCart
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-orange-500 hover:bg-orange-600 text-white"
                          )}
                        >
                          <Plus className="w-4 h-4" />
                          {isInCart ? '추가 담기' : '견적 담기'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 견적 요약 바 (장바구니에 상품이 있을 때만 표시) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-orange-100 text-sm">선택 품목</span>
                <p className="text-xl font-bold">{cart.length}개</p>
              </div>
              <div>
                <span className="text-orange-100 text-sm">총 수량</span>
                <p className="text-xl font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)}개</p>
              </div>
              <div>
                <span className="text-orange-100 text-sm">예상 금액</span>
                <p className="text-xl font-bold">{totalAmount.toLocaleString('ko-KR')}원</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCart([])}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                초기화
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-white text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                견적서 요청
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 견적 요청 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">견적서 요청</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 space-y-6">
              {/* 선택한 상품 목록 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">선택한 상품</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">상품명</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">단가</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-600">수량</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">금액</th>
                        <th className="px-4 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cart.map((item) => (
                        <tr key={item.product.product_no} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            <span dangerouslySetInnerHTML={{ __html: item.product.product_name }} />
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {Number(item.product.price).toLocaleString('ko-KR')}원
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => updateCartQuantity(item.product.product_no, -1)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product.product_no, 1)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            {(Number(item.product.price) * item.quantity).toLocaleString('ko-KR')}원
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeFromCart(item.product.product_no)}
                              className="p-1 hover:bg-red-100 text-red-500 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-blue-50 font-bold">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-gray-700">합계</td>
                        <td className="px-4 py-3 text-right text-blue-600 text-lg">
                          {totalAmount.toLocaleString('ko-KR')}원
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 고객 정보 폼 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">고객 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름 / 회사명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="홍길동 / ABC 주식회사"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@email.com"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      추가 요청사항
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="납기일, 배송지 등 추가 요청사항을 입력해주세요."
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmitQuote}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                견적 요청하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 여백 (견적 바가 있을 때) */}
      {cart.length > 0 && <div className="h-24" />}
    </div>
  );
}
